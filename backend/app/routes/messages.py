from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas.message import MessageCreate, MessageResponse, MessageUpdate, MessageWithUserResponse
from ..models import Message, Channel, Server, User
from ..utils.auth import get_current_active_user
from sqlalchemy import desc

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if channel exists
    channel = db.query(Channel).filter(Channel.id == message_data.channel_id).first()
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Channel with ID {message_data.channel_id} not found"
        )
    
    # Check if user is a member of the server
    server = db.query(Server).filter(Server.id == channel.server_id).first()
    if current_user not in server.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this server"
        )
    
    # Check if channel is a text channel
    if channel.type != "text":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send messages to non-text channels"
        )
    
    # Create new message
    db_message = Message(
        content=message_data.content,
        user_id=current_user.id,
        channel_id=message_data.channel_id
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message

@router.get("/channel/{channel_id}", response_model=List[MessageWithUserResponse])
def get_messages_by_channel(
    channel_id: int,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if channel exists
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Channel with ID {channel_id} not found"
        )
    
    # Check if user is a member of the server
    server = db.query(Server).filter(Server.id == channel.server_id).first()
    if current_user not in server.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this server"
        )
    
    # Get messages from channel, newest first
    messages = db.query(Message, User.username).join(User, Message.user_id == User.id) \
        .filter(Message.channel_id == channel_id) \
        .order_by(desc(Message.created_at)) \
        .limit(limit).offset(offset).all()
    
    # Convert to response model format
    result = []
    for message, username in messages:
        message_dict = {
            "id": message.id,
            "content": message.content,
            "user_id": message.user_id,
            "channel_id": message.channel_id,
            "created_at": message.created_at,
            "username": username
        }
        result.append(message_dict)
    
    return result

@router.put("/{message_id}", response_model=MessageResponse)
def update_message(
    message_id: int,
    message_update: MessageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if message exists
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with ID {message_id} not found"
        )
    
    # Check if user is the author of the message
    if message.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own messages"
        )
    
    # Update message
    if message_update.content:
        message.content = message_update.content
    
    db.commit()
    db.refresh(message)
    
    return message

@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if message exists
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with ID {message_id} not found"
        )
    
    # Check if channel exists
    channel = db.query(Channel).filter(Channel.id == message.channel_id).first()
    server = db.query(Server).filter(Server.id == channel.server_id).first()
    
    # Check if user is the author of the message or the server owner
    if message.user_id != current_user.id and server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own messages or as the server owner"
        )
    
    # Delete message
    db.delete(message)
    db.commit()
    
    return
