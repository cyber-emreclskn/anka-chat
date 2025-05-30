import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectTextChannels, 
  selectVoiceChannels, 
  setCurrentChannel 
} from '../../features/channels/channelsSlice';
import { 
  clearMessages, 
  fetchMessages 
} from '../../features/messages/messagesSlice';
import { selectCurrentServer } from '../../features/servers/serversSlice';
import { logout } from '../../features/auth/authSlice';
import CreateChannelModal from './CreateChannelModal';

const ChannelSidebar = () => {
  const currentServer = useSelector(selectCurrentServer);
  const textChannels = useSelector(selectTextChannels);
  const voiceChannels = useSelector(selectVoiceChannels);
  const currentChannel = useSelector(state => state.channels.currentChannel);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleChannelClick = (channel) => {
    dispatch(clearMessages());
    dispatch(setCurrentChannel(channel));
    
    if (channel.type === 'text') {
      dispatch(fetchMessages({ channelId: channel.id }));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // If no server is selected, show a placeholder
  if (!currentServer) {
    return (
      <div className="w-60 bg-discord-sidebar flex flex-col">
        <div className="p-4 border-b border-discord-dark shadow-sm">
          <h2 className="text-white font-semibold">AnkaChat</h2>
        </div>
        <div className="flex-1 p-4 text-discord-lightest">
          <p>Sol taraftan bir sunucu seçin veya yeni bir sunucu oluşturun.</p>
        </div>
        <div className="p-3 bg-discord-dark mt-auto">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center mr-2">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{user?.username}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-discord-lightest hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-60 bg-discord-sidebar flex flex-col">
      {/* Server header */}
      <div className="p-4 border-b border-discord-dark shadow-sm">
        <h2 className="text-white font-semibold truncate">{currentServer.name}</h2>
      </div>
      
      {/* Channel list */}
      <div className="flex-1 p-2 overflow-y-auto">
        {/* Text channels */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-1">
            <h3 className="text-xs uppercase font-semibold text-discord-lightest tracking-wider">
              Yazılı Kanallar
            </h3>
            {currentServer.owner_id === user?.id && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-discord-lightest hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {textChannels.length === 0 ? (
            <p className="text-sm text-discord-lightest px-2">Henüz kanal yok</p>
          ) : (
            <ul>
              {textChannels.map((channel) => (
                <li key={channel.id}>
                  <button
                    onClick={() => handleChannelClick(channel)}
                    className={`w-full text-left px-2 py-1 rounded flex items-center ${
                      currentChannel?.id === channel.id
                        ? 'bg-discord-light text-white'
                        : 'text-discord-lightest hover:bg-discord-dark hover:text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 opacity-75">
                      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{channel.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Voice channels */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1">
            <h3 className="text-xs uppercase font-semibold text-discord-lightest tracking-wider">
              Sesli Kanallar
            </h3>
            {currentServer.owner_id === user?.id && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-discord-lightest hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {voiceChannels.length === 0 ? (
            <p className="text-sm text-discord-lightest px-2">Henüz kanal yok</p>
          ) : (
            <ul>
              {voiceChannels.map((channel) => (
                <li key={channel.id}>
                  <button
                    onClick={() => handleChannelClick(channel)}
                    className={`w-full text-left px-2 py-1 rounded flex items-center ${
                      currentChannel?.id === channel.id
                        ? 'bg-discord-light text-white'
                        : 'text-discord-lightest hover:bg-discord-dark hover:text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 opacity-75">
                      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                    </svg>
                    <span className="truncate">{channel.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* User info */}
      <div className="p-3 bg-discord-dark mt-auto">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center mr-2">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{user?.username}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-discord-lightest hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Create channel modal */}
      {isCreateModalOpen && (
        <CreateChannelModal 
          serverId={currentServer.id}
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ChannelSidebar;
