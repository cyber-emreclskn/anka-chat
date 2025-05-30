import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllMessages, fetchMessages, selectHasMoreMessages } from '../../features/messages/messagesSlice';
import { selectCurrentChannel } from '../../features/channels/channelsSlice';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import VoiceChannel from './VoiceChannel';
import socketService from '../../services/socket';

const ChatArea = () => {
  const messages = useSelector(selectAllMessages);
  const currentChannel = useSelector(selectCurrentChannel);
  const hasMoreMessages = useSelector(selectHasMoreMessages);
  const messagesStatus = useSelector(state => state.messages.status);
  const token = useSelector(state => state.auth.token);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  // Connect to WebSocket when current channel changes
  useEffect(() => {
    if (currentChannel && token && currentChannel.type === 'text') {
      // Connect to text channel WebSocket
      socketService.connectToTextChannel(currentChannel.id, token);
      
      // Set up message handler
      socketService.onMessage((message) => {
        // Messages are added via Redux action in MessageInput component
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
      
      // Cleanup on unmount
      return () => {
        socketService.disconnectFromChannel();
      };
    }
  }, [currentChannel, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  // Load more messages when user scrolls to top
  const handleLoadMore = () => {
    if (hasMoreMessages && messagesStatus !== 'loading' && currentChannel) {
      dispatch(fetchMessages({ 
        channelId: currentChannel.id, 
        offset: messages.length 
      }));
    }
  };

  // If no channel is selected, show a placeholder
  if (!currentChannel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-discord-lightest">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mb-4 text-discord-light">
          <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" clipRule="evenodd" />
        </svg>
        <p className="text-xl font-medium mb-2">Kanal seçilmedi</p>
        <p>Sol taraftan bir kanal seçin veya yeni bir kanal oluşturun.</p>
      </div>
    );
  }

  // Voice channel interface
  if (currentChannel.type === 'voice') {
    return <VoiceChannel channel={currentChannel} />;
  }

  // Text channel interface
  return (
    <div className="flex-1 flex flex-col">
      {/* Channel header */}
      <div className="px-4 py-3 border-b border-discord-dark shadow-sm flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-discord-lightest">
          <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" clipRule="evenodd" />
        </svg>
        <h2 className="text-white font-semibold">{currentChannel.name}</h2>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMoreMessages && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={messagesStatus === 'loading'}
              className="px-3 py-1 text-sm bg-discord-light text-white rounded hover:bg-opacity-80"
            >
              {messagesStatus === 'loading' ? 'Yükleniyor...' : 'Daha fazla mesaj yükle'}
            </button>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="text-center text-discord-lightest my-8">
            <p>Henüz mesaj yok. İlk mesajı gönderen siz olun!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <MessageInput channel={currentChannel} />
    </div>
  );
};

export default ChatArea;
