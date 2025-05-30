import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMessage, deleteMessage } from '../../features/messages/messagesSlice';

const MessageItem = ({ message }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const currentUser = useSelector(state => state.auth.user);
  const currentServer = useSelector(state => state.servers.currentServer);
  const dispatch = useDispatch();
  
  const isOwner = message.user_id === currentUser?.id;
  const isServerOwner = currentServer?.owner_id === currentUser?.id;
  const canEdit = isOwner;
  const canDelete = isOwner || isServerOwner;
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };
  
  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      dispatch(updateMessage({ 
        id: message.id, 
        messageData: { content: editContent.trim() } 
      }));
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };
  
  const handleDelete = () => {
    if (window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
      dispatch(deleteMessage(message.id));
    }
  };

  return (
    <div className="group hover:bg-discord-dark hover:bg-opacity-30 -mx-2 px-2 py-1 rounded">
      <div className="flex">
        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-discord-accent flex items-center justify-center text-white font-medium mr-3 flex-shrink-0">
          {message.username?.charAt(0).toUpperCase()}
        </div>
        
        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline">
            <p className="font-medium text-white mr-2">{message.username}</p>
            <span className="text-xs text-discord-lightest opacity-70">
              {formatTime(message.created_at)}
            </span>
          </div>
          
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="input-field w-full h-20 resize-none"
                autoFocus
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-sm bg-discord-accent text-white rounded hover:bg-opacity-80"
                >
                  Kaydet
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-sm bg-discord-light text-white rounded hover:bg-opacity-80"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <p className="text-discord-lightest break-words">{message.content}</p>
          )}
        </div>
        
        {/* Message actions */}
        {(canEdit || canDelete) && !isEditing && (
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <button
                onClick={handleEdit}
                className="p-1 text-discord-lightest hover:text-white hover:bg-discord-light rounded"
                title="Düzenle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-1 text-discord-lightest hover:text-red-500 hover:bg-discord-light rounded"
                title="Sil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
