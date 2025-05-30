import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createServer, selectServerStatus } from '../../features/servers/serversSlice';

const CreateServerModal = ({ onClose }) => {
  const [serverName, setServerName] = useState('');
  const [serverDescription, setServerDescription] = useState('');
  const dispatch = useDispatch();
  const status = useSelector(selectServerStatus);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createServer({ 
      name: serverName, 
      description: serverDescription 
    }));
    
    if (status !== 'loading') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-discord-sidebar rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Yeni Sunucu Oluştur</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="serverName" className="block text-sm font-medium text-discord-lightest mb-1">
              Sunucu Adı
            </label>
            <input
              id="serverName"
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              required
              className="input-field w-full"
              placeholder="Sunucu adını girin"
            />
          </div>
          
          <div>
            <label htmlFor="serverDescription" className="block text-sm font-medium text-discord-lightest mb-1">
              Açıklama (İsteğe bağlı)
            </label>
            <textarea
              id="serverDescription"
              value={serverDescription}
              onChange={(e) => setServerDescription(e.target.value)}
              className="input-field w-full h-24 resize-none"
              placeholder="Sunucu açıklaması girin"
            />
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
              {status === 'loading' ? 'Oluşturuluyor...' : 'Sunucu Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServerModal;
