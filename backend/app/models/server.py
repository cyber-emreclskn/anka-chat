from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

# Association table for many-to-many relationship between users and servers
server_members = Table(
    "server_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("server_id", Integer, ForeignKey("servers.id"))
)

class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    members = relationship("User", secondary=server_members, backref="servers")
    channels = relationship("Channel", back_populates="server", cascade="all, delete-orphan")
