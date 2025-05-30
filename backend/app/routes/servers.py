from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas.server import ServerCreate, ServerResponse, ServerUpdate, ServerWithMembersResponse
from ..models import Server, User, server_members
from ..utils.auth import get_current_active_user

router = APIRouter(prefix="/servers", tags=["servers"])

@router.post("/", response_model=ServerResponse, status_code=status.HTTP_201_CREATED)
def create_server(
    server_data: ServerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Create new server
    db_server = Server(
        name=server_data.name,
        description=server_data.description,
        owner_id=current_user.id
    )
    
    db.add(db_server)
    db.commit()
    db.refresh(db_server)
    
    # Add owner as a member
    db_server.members.append(current_user)
    db.commit()
    
    return db_server

@router.get("/", response_model=List[ServerResponse])
def get_servers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get all servers that the user is a member of
    return current_user.servers

@router.get("/{server_id}", response_model=ServerWithMembersResponse)
def get_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if server exists and user is a member
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
    
    return server

@router.put("/{server_id}", response_model=ServerResponse)
def update_server(
    server_id: int,
    server_update: ServerUpdate,
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
    
    # Check if user is the owner
    if server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the server owner can update server details"
        )
    
    # Update server details
    if server_update.name:
        server.name = server_update.name
    if server_update.description is not None:  # Allow empty description
        server.description = server_update.description
    
    db.commit()
    db.refresh(server)
    
    return server

@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_server(
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
    
    # Check if user is the owner
    if server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the server owner can delete the server"
        )
    
    # Delete server
    db.delete(server)
    db.commit()
    
    return

@router.post("/{server_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_member(
    server_id: int,
    user_id: int,
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
    
    # Check if user is the owner
    if server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the server owner can add members"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Check if user is already a member
    if user in server.members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is already a member of this server"
        )
    
    # Add user to server
    server.members.append(user)
    db.commit()
    
    return

@router.delete("/{server_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    server_id: int,
    user_id: int,
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
    
    # Check if user is the owner or the user being removed
    if server.owner_id != current_user.id and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the server owner or the user themself can remove a member"
        )
    
    # Cannot remove the owner
    if user_id == server.owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the server owner"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Check if user is a member
    if user not in server.members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is not a member of this server"
        )
    
    # Remove user from server
    server.members.remove(user)
    db.commit()
    
    return
