from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    channel_id: int

class MessageUpdate(BaseModel):
    content: Optional[str] = None

class MessageResponse(MessageBase):
    id: int
    user_id: int
    channel_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class MessageWithUserResponse(MessageResponse):
    username: str
    
    class Config:
        from_attributes = True
