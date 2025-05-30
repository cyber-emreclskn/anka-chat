from fastapi import WebSocket
from typing import Dict, List, Set
import json

class ConnectionManager:
    def __init__(self):
        # Dictionary to store active connections by channel ID
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Dictionary to store user information by connection
        self.connection_user: Dict[WebSocket, dict] = {}
        # Set to track users in voice channels
        self.voice_users: Dict[int, Set[dict]] = {}
    
    async def connect(self, websocket: WebSocket, channel_id: int, user_info: dict):
        await websocket.accept()
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []
        self.active_connections[channel_id].append(websocket)
        self.connection_user[websocket] = user_info
    
    def disconnect(self, websocket: WebSocket, channel_id: int):
        if channel_id in self.active_connections:
            if websocket in self.active_connections[channel_id]:
                self.active_connections[channel_id].remove(websocket)
            # Clean up empty channels
            if not self.active_connections[channel_id]:
                del self.active_connections[channel_id]
        
        if websocket in self.connection_user:
            del self.connection_user[websocket]
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str, channel_id: int, exclude: WebSocket = None):
        if channel_id in self.active_connections:
            for connection in self.active_connections[channel_id]:
                if connection != exclude:
                    await connection.send_text(message)
    
    # Voice channel management
    def join_voice_channel(self, channel_id: int, user_info: dict):
        if channel_id not in self.voice_users:
            self.voice_users[channel_id] = set()
        self.voice_users[channel_id].add(json.dumps(user_info))
        return self.get_voice_users(channel_id)
    
    def leave_voice_channel(self, channel_id: int, user_info: dict):
        if channel_id in self.voice_users:
            user_json = json.dumps(user_info)
            if user_json in self.voice_users[channel_id]:
                self.voice_users[channel_id].remove(user_json)
            # Clean up empty channels
            if not self.voice_users[channel_id]:
                del self.voice_users[channel_id]
        return self.get_voice_users(channel_id)
    
    def get_voice_users(self, channel_id: int):
        if channel_id not in self.voice_users:
            return []
        return [json.loads(user_json) for user_json in self.voice_users[channel_id]]


# Create a global connection manager instance
manager = ConnectionManager()
