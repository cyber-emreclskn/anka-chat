import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllServers, setCurrentServer, fetchServerById } from '../../features/servers/serversSlice';
import { fetchChannels } from '../../features/channels/channelsSlice';
import { clearMessages } from '../../features/messages/messagesSlice';
import ServerIcon from './ServerIcon';
import CreateServerModal from './CreateServerModal';

const ServerSidebar = () => {
  const servers = useSelector(selectAllServers);
  const currentServer = useSelector(state => state.servers.currentServer);
  const dispatch = useDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleServerClick = (server) => {
    dispatch(clearMessages());
    dispatch(setCurrentServer(server));
    dispatch(fetchServerById(server.id));
    dispatch(fetchChannels(server.id));
  };

  return (
    <div className="w-[72px] bg-discord-dark flex flex-col items-center py-3 space-y-2 overflow-y-auto">
      {/* Home button */}
      <button
        className="w-12 h-12 rounded-full bg-discord-accent flex items-center justify-center hover:rounded-2xl transition-all duration-200"
        onClick={() => {
          dispatch(setCurrentServer(null));
          dispatch(clearMessages());
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="white" 
          className="w-6 h-6"
        >
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
      </button>
      
      {/* Separator */}
      <div className="w-8 h-0.5 bg-discord-light rounded-full my-1"></div>
      
      {/* Server list */}
      <div className="flex flex-col space-y-2 w-full items-center">
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isActive={currentServer?.id === server.id}
            onClick={() => handleServerClick(server)}
          />
        ))}
      </div>
      
      {/* Add server button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="w-12 h-12 rounded-full bg-discord-light flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white hover:rounded-2xl transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Create server modal */}
      {isCreateModalOpen && (
        <CreateServerModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default ServerSidebar;
