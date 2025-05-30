import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, addMessage } from '../../features/messages/messagesSlice';
import socketService from '../../services/socket';

const MessageInput = ({ channel }) => {
  const [message, setMessage] = useState('');
  const user = useSelector(state => state.auth.user);
  const status = useSelector(state => state.messages.status);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim()) {
      // Option 1: Using WebSocket to send message (preferred for real-time)
      socketService.sendMessage(message.trim());
      
      // Option 2: Using API (fallback)
      // dispatch(sendMessage({
      //   content: message.trim(),
      //   channel_id: channel.id
      // }));
      
      // Clear input after sending
      setMessage('');
    }
  };

  return (
    <div className="px-4 py-3 bg-discord-sidebar">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`${channel.name} kanalına mesaj yaz...`}
          className="flex-1 bg-discord-dark text-white px-4 py-2 rounded-l focus:outline-none"
        />
        <button
          type="submit"
          disabled={!message.trim() || status === 'loading'}
          className={`bg-discord-accent text-white px-4 py-2 rounded-r ${
            !message.trim() || status === 'loading'
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-opacity-80'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
