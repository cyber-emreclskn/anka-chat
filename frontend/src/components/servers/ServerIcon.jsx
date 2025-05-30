import React from 'react';

const ServerIcon = ({ server, isActive, onClick }) => {
  // Generate initial letters for the server name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 relative group ${
        isActive ? 'bg-discord-accent text-white rounded-2xl' : 'bg-discord-light text-white hover:bg-discord-accent hover:rounded-2xl'
      }`}
    >
      {/* Server indicator line */}
      <div
        className={`absolute left-0 w-1 h-9 bg-white rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform ${
          isActive ? 'scale-y-100' : ''
        }`}
      ></div>
      
      {/* Server name initial */}
      <span className="font-semibold text-lg">{getInitials(server.name)}</span>
      
      {/* Tooltip for server name */}
      <div className="absolute left-16 whitespace-nowrap px-2 py-1 bg-black bg-opacity-90 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {server.name}
      </div>
    </button>
  );
};

export default ServerIcon;
