from fastapi import FastAPI, WebSocket, Depends, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models
from .database import engine, get_db
from .routes import auth, users, servers, channels, messages
from .sockets.chat import handle_chat_connection, handle_voice_connection
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn
import logging

# Create tables
models.Base.metadata.create_all(bind=engine)

# Setup rate limiting
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="AnkaChat API",
    description="API for AnkaChat - Türkiye'nin Açık Kaynak Sohbet Uygulaması",
    version="1.0.0"
)

# Register rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "*"  # For development, replace with specific origins in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(servers.router)
app.include_router(channels.router)
app.include_router(messages.router)

# WebSocket endpoints
@app.websocket("/ws/chat/{channel_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket, 
    channel_id: int, 
    token: str = None,
    db: Session = Depends(get_db)
):
    if not token:
        await websocket.close(code=4001)  # Unauthorized
        return
    
    await handle_chat_connection(websocket, channel_id, token, db)

@app.websocket("/ws/voice/{channel_id}")
async def websocket_voice_endpoint(
    websocket: WebSocket, 
    channel_id: int, 
    token: str = None,
    db: Session = Depends(get_db)
):
    if not token:
        await websocket.close(code=4001)  # Unauthorized
        return
    
    await handle_voice_connection(websocket, channel_id, token, db)

@app.get("/")
async def root():
    return {"message": "Welcome to AnkaChat API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
