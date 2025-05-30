from fastapi import WebSocket, WebSocketDisconnect, HTTPException, Depends
from typing import Dict, Optional
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Channel, Server, User, Message
from .connection_manager import manager
from jose import JWTError, jwt
import json
from ..utils.auth import SECRET_KEY, ALGORITHM
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

async def get_user_from_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        user = db.query(User).filter(User.username == username).first()
        return user
    except JWTError:
        return None

async def handle_chat_connection(websocket: WebSocket, channel_id: int, token: str, db: Session):
    # Authenticate user
    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001)  # Unauthorized
        return
    
    # Check if channel exists
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        await websocket.close(code=4004)  # Not Found
        return
    
    # Check if user is a member of the server
    server = db.query(Server).filter(Server.id == channel.server_id).first()
    if user not in server.members:
        await websocket.close(code=4003)  # Forbidden
        return
    
    # Check if channel is a text channel
    if channel.type != "text":
        await websocket.close(code=4000)  # Bad Request
        return
    
    # Accept connection
    user_info = {
        "id": user.id,
        "username": user.username
    }
    
    await manager.connect(websocket, channel_id, user_info)
    
    # Notify all channel members that a new user connected
    join_message = {
        "type": "user_joined",
        "data": {
            "channel_id": channel_id,
            "user": user_info,
            "timestamp": datetime.now().isoformat()
        }
    }
    await manager.broadcast(json.dumps(join_message), channel_id)
    
    try:
        while True:
            # Receive message from websocket
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                
                # Handle message type
                if message_data.get("type") == "chat_message":
                    content = message_data.get("data", {}).get("content", "").strip()
                    
                    if content:
                        # Save message to database
                        db_message = Message(
                            content=content,
                            user_id=user.id,
                            channel_id=channel_id
                        )
                        db.add(db_message)
                        db.commit()
                        db.refresh(db_message)
                        
                        # Broadcast message to all channel members
                        chat_message = {
                            "type": "chat_message",
                            "data": {
                                "id": db_message.id,
                                "content": content,
                                "user_id": user.id,
                                "username": user.username,
                                "channel_id": channel_id,
                                "created_at": db_message.created_at.isoformat()
                            }
                        }
                        await manager.broadcast(json.dumps(chat_message), channel_id)
                        
            except json.JSONDecodeError:
                # Send error message back to the user
                error_message = {
                    "type": "error",
                    "data": {
                        "message": "Invalid JSON format"
                    }
                }
                await manager.send_personal_message(json.dumps(error_message), websocket)
    
    except WebSocketDisconnect:
        # Clean up on disconnect
        manager.disconnect(websocket, channel_id)
        
        # Notify all channel members that a user disconnected
        leave_message = {
            "type": "user_left",
            "data": {
                "channel_id": channel_id,
                "user": user_info,
                "timestamp": datetime.now().isoformat()
            }
        }
        await manager.broadcast(json.dumps(leave_message), channel_id)

async def handle_voice_connection(websocket: WebSocket, channel_id: int, token: str, db: Session):
    # Authenticate user
    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001)  # Unauthorized
        return
    
    # Check if channel exists
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        await websocket.close(code=4004)  # Not Found
        return
    
    # Check if user is a member of the server
    server = db.query(Server).filter(Server.id == channel.server_id).first()
    if user not in server.members:
        await websocket.close(code=4003)  # Forbidden
        return
    
    # Check if channel is a voice channel
    if channel.type != "voice":
        await websocket.close(code=4000)  # Bad Request
        return
    
    # Accept connection
    user_info = {
        "id": user.id,
        "username": user.username
    }
    
    await manager.connect(websocket, channel_id, user_info)
    
    # Add user to voice channel participants
    voice_users = manager.join_voice_channel(channel_id, user_info)
    
    # Notify all channel members of the updated voice participants
    voice_update = {
        "type": "voice_users_update",
        "data": {
            "channel_id": channel_id,
            "users": voice_users,
            "timestamp": datetime.now().isoformat()
        }
    }
    await manager.broadcast(json.dumps(voice_update), channel_id)
    
    try:
        while True:
            # Receive WebRTC signaling data
            data = await websocket.receive_text()
            
            try:
                signal_data = json.loads(data)
                
                # Handle signaling message types
                if signal_data.get("type") in ["offer", "answer", "ice-candidate"]:
                    # Add the sender information
                    signal_data["from"] = user_info
                    
                    # If there's a specific target user, send only to them
                    target_user_id = signal_data.get("target")
                    if target_user_id:
                        # Find the connection for the target user
                        for conn, conn_user in manager.connection_user.items():
                            if conn_user.get("id") == target_user_id and conn in manager.active_connections.get(channel_id, []):
                                await manager.send_personal_message(json.dumps(signal_data), conn)
                                break
                    else:
                        # Broadcast to all other users in the channel
                        await manager.broadcast(json.dumps(signal_data), channel_id, exclude=websocket)
            
            except json.JSONDecodeError:
                # Send error message back to the user
                error_message = {
                    "type": "error",
                    "data": {
                        "message": "Invalid JSON format"
                    }
                }
                await manager.send_personal_message(json.dumps(error_message), websocket)
    
    except WebSocketDisconnect:
        # Clean up on disconnect
        manager.disconnect(websocket, channel_id)
        
        # Remove user from voice channel participants
        voice_users = manager.leave_voice_channel(channel_id, user_info)
        
        # Notify all channel members of the updated voice participants
        voice_update = {
            "type": "voice_users_update",
            "data": {
                "channel_id": channel_id,
                "users": voice_users,
                "timestamp": datetime.now().isoformat()
            }
        }
        await manager.broadcast(json.dumps(voice_update), channel_id)
