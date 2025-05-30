import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import ServerSidebar from '../servers/ServerSidebar';
import ChannelSidebar from '../channels/ChannelSidebar';
import { fetchServers } from '../../features/servers/serversSlice';

const MainLayout = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchServers());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-discord-dark text-white">
      {/* Server sidebar */}
      <ServerSidebar />
      
      {/* Channel sidebar */}
      <ChannelSidebar />
      
      {/* Main content area */}
      <main className="flex-1 flex flex-col bg-discord-main">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
