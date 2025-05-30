import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setVoiceUsers, selectVoiceUsers } from '../../features/messages/messagesSlice';
import socketService from '../../services/socket';

const VoiceChannel = ({ channel }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stream, setStream] = useState(null);
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const voiceUsers = useSelector(selectVoiceUsers);
  const dispatch = useDispatch();

  const handleJoinVoice = async () => {
    try {
      // Request microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      
      // Connect to voice channel WebSocket
      socketService.connectToVoiceChannel(channel.id, token, mediaStream);
      
      // Set up voice users handler
      socketService.onVoiceUsers((users) => {
        dispatch(setVoiceUsers(users));
      });
      
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to access microphone:', error);
      alert('Mikrofona erişim sağlanamadı. Lütfen izinleri kontrol edin.');
    }
  };

  const handleLeaveVoice = () => {
    // Disconnect from voice channel
    socketService.disconnectFromVoiceChannel();
    setIsConnected(false);
    dispatch(setVoiceUsers([]));
    
    // Stop microphone stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        handleLeaveVoice();
      }
    };
  }, [isConnected]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel header */}
      <div className="px-4 py-3 border-b border-discord-dark shadow-sm flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-discord-lightest">
          <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
          <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
        </svg>
        <h2 className="text-white font-semibold">{channel.name}</h2>
      </div>
      
      {/* Voice channel interface */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="mb-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Sesli Kanal: {channel.name}</h3>
          <p className="text-discord-lightest mb-4">
            {isConnected 
              ? 'Sesli kanala bağlandınız. Katılımcıları aşağıda görebilirsiniz.' 
              : 'Sesli kanala katılmak için aşağıdaki butona tıklayın.'}
          </p>
          
          {isConnected ? (
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`flex items-center px-4 py-2 rounded ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-discord-light hover:bg-discord-dark'
                } text-white transition-colors`}
              >
                {isMuted ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                      <path d="M10.5 6.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0v-10.5z" />
                      <path d="M14.25 6.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0v-10.5z" />
                    </svg>
                    Mikrofon Kapalı
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                    </svg>
                    Mikrofon Açık
                  </>
                )}
              </button>
              
              <button
                onClick={handleLeaveVoice}
                className="flex items-center px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
                Kanaldan Ayrıl
              </button>
            </div>
          ) : (
            <button
              onClick={handleJoinVoice}
              className="flex items-center px-4 py-2 rounded bg-discord-accent hover:bg-opacity-80 text-white transition-colors mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
              Kanala Katıl
            </button>
          )}
        </div>
        
        {/* Voice users list */}
        <div className="bg-discord-dark rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Ses Kanalındaki Kullanıcılar</h4>
          
          {voiceUsers.length === 0 ? (
            <p className="text-discord-lightest">Henüz kimse katılmadı.</p>
          ) : (
            <ul className="space-y-3">
              {voiceUsers.map((voiceUser) => (
                <li key={voiceUser.id} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center text-white font-medium mr-3">
                    {voiceUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white">
                    {voiceUser.username}
                    {voiceUser.id === user?.id ? ' (Sen)' : ''}
                  </span>
                  
                  {voiceUser.id === user?.id && isMuted && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-2 text-red-500">
                      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                      <path d="M10.5 6.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0v-10.5z" />
                      <path d="M14.25 6.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0v-10.5z" />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChannel;
