from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas.channel import ChannelCreate, ChannelResponse, ChannelUpdate
from ..models import Channel, Server, User
from ..utils.auth import get_current_active_user

router = APIRouter(prefix="/channels", tags=["channels"])

@router.post("/", response_model=ChannelResponse, status_code=status.HTTP_201_CREATED)
def create_channel(
    channel_data: ChannelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if server exists
    server = db.query(Server).filter(Server.id == channel_data.server_id).first()
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Server with ID {channel_data.server_id} not found"
        )
    
    # Check if user is a member of the server
    if current_user not in server.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this server"
        )
    
    # Only server owner can create channels
    if server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the server owner can create channels"
        )
    
    # Create new channel
    db_channel = Channel(
        name=channel_data.name,
        type=channel_data.type,
        server_id=channel_data.server_id
    )
    
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    
    return db_channel

@router.get("/server/{server_id}", response_model=List[ChannelResponse])
def get_channels_by_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if server exists
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Server with ID {server_id} not found"
        )
    
    # Check if user is a member of the server
    if current_user not in server.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this server"
        )
    
    # Get all channels in the server
    channels = db.query(Channel).filter(Channel.server_id == server_id).all()
    
    return channels

@router.get("/{channel_id}", response_model=ChannelResponse)
def get_channel(
    channel_id: int,
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
    
    return channel

@router.put("/{channel_id}", response_model=ChannelResponse)
def update_channel(
    channel_id: int,
    channel_update: ChannelUpdate,
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
    
    # Check if user is the server owner
    server = db.query(Server).filter(Server.id == channel.server_id).first()
    if server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the server owner can update channels"
        )
    
    # Update channel details
    if channel_update.name:
        channel.name = channel_update.name
    
    db.commit()
    db.refresh(channel)
    
    return channel

@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_channel(
    channel_id: int,
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
    
    # Check if user is the server owner
    server = db.query(Server).filter(Server.id == channel.server_id).first()
    if server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the server owner can delete channels"
        )
    
    # Delete channel
    db.delete(channel)
    db.commit()
    
    return
