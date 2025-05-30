from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class ChannelBase(BaseModel):
    name: str
    type: Literal["text", "voice"]

class ChannelCreate(ChannelBase):
    server_id: int

class ChannelUpdate(BaseModel):
    name: Optional[str] = None

class ChannelResponse(ChannelBase):
    id: int
    server_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
