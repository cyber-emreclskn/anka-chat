import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createChannel, selectChannelStatus } from '../../features/channels/channelsSlice';

const CreateChannelModal = ({ serverId, onClose }) => {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('text');
  const dispatch = useDispatch();
  const status = useSelector(selectChannelStatus);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createChannel({ 
      name: channelName, 
      type: channelType,
      server_id: serverId
    }));
    
    if (status !== 'loading') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-discord-sidebar rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Yeni Kanal Oluştur</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="channelName" className="block text-sm font-medium text-discord-lightest mb-1">
              Kanal Adı
            </label>
            <input
              id="channelName"
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              required
              className="input-field w-full"
              placeholder="Kanal adını girin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-discord-lightest mb-1">
              Kanal Tipi
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="text"
                  type="radio"
                  name="channelType"
                  value="text"
                  checked={channelType === 'text'}
                  onChange={() => setChannelType('text')}
                  className="h-4 w-4 text-discord-accent focus:ring-discord-accent"
                />
                <label htmlFor="text" className="ml-2 block text-sm text-discord-lightest">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" clipRule="evenodd" />
                    </svg>
                    Yazılı Kanal
                  </div>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="voice"
                  type="radio"
                  name="channelType"
                  value="voice"
                  checked={channelType === 'voice'}
                  onChange={() => setChannelType('voice')}
                  className="h-4 w-4 text-discord-accent focus:ring-discord-accent"
                />
                <label htmlFor="voice" className="ml-2 block text-sm text-discord-lightest">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                    </svg>
                    Sesli Kanal
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary"
            >
              {status === 'loading' ? 'Oluşturuluyor...' : 'Kanal Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
