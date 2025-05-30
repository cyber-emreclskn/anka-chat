import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

class SocketService {
  constructor() {
    this.socket = null;
    this.peers = {};
    this.currentChannel = null;
    this.currentVoiceChannel = null;
    this.callbacks = {
      onMessage: () => {},
      onUserJoined: () => {},
      onUserLeft: () => {},
      onVoiceUsers: () => {},
    };
    this.stream = null;
  }

  // Connect to text channel WebSocket
  connectToTextChannel(channelId, token) {
    if (this.socket) {
      this.disconnectFromChannel();
    }
    
    const url = `ws://localhost:8000/ws/chat/${channelId}?token=${token}`;
    this.socket = new WebSocket(url);
    this.currentChannel = channelId;

    this.socket.onopen = () => {
      console.log(`Connected to channel ${channelId}`);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'chat_message':
          this.callbacks.onMessage(data.data);
          break;
        case 'user_joined':
          this.callbacks.onUserJoined(data.data);
          break;
        case 'user_left':
          this.callbacks.onUserLeft(data.data);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    };

    this.socket.onclose = () => {
      console.log(`Disconnected from channel ${channelId}`);
      this.socket = null;
      this.currentChannel = null;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }

  // Connect to voice channel
  connectToVoiceChannel(channelId, token, stream) {
    if (this.voiceSocket) {
      this.disconnectFromVoiceChannel();
    }
    
    this.stream = stream;
    const url = `ws://localhost:8000/ws/voice/${channelId}?token=${token}`;
    this.voiceSocket = new WebSocket(url);
    this.currentVoiceChannel = channelId;

    this.voiceSocket.onopen = () => {
      console.log(`Connected to voice channel ${channelId}`);
    };

    this.voiceSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'voice_users_update':
          this.handleVoiceUsersUpdate(data.data);
          break;
        case 'offer':
          this.handleOffer(data);
          break;
        case 'answer':
          this.handleAnswer(data);
          break;
        case 'ice-candidate':
          this.handleIceCandidate(data);
          break;
        default:
          console.log('Unknown voice message type:', data.type);
      }
    };

    this.voiceSocket.onclose = () => {
      console.log(`Disconnected from voice channel ${channelId}`);
      this.voiceSocket = null;
      this.currentVoiceChannel = null;
      this.destroyAllPeers();
    };

    this.voiceSocket.onerror = (error) => {
      console.error('Voice WebSocket Error:', error);
    };
  }

  // Send a text message
  sendMessage(content) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'chat_message',
        data: {
          content: content
        }
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Handle voice users update
  handleVoiceUsersUpdate(data) {
    this.callbacks.onVoiceUsers(data.users);
    
    // Set up peer connections for new users
    const { users } = data;
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
    
    if (!currentUserId) return;
    
    // Create peer connections for new users
    users.forEach(user => {
      if (user.id !== currentUserId && !this.peers[user.id]) {
        this.createPeer(user.id, true);
      }
    });
    
    // Clean up peers that left
    Object.keys(this.peers).forEach(peerId => {
      const userStillInChannel = users.find(user => user.id === parseInt(peerId));
      if (!userStillInChannel) {
        this.destroyPeer(peerId);
      }
    });
  }
  
  // Create a peer connection
  createPeer(userId, initiator) {
    const peer = new SimplePeer({
      initiator,
      stream: this.stream,
      trickle: true
    });
    
    peer.on('signal', data => {
      const signalData = {
        type: initiator ? 'offer' : 'answer',
        target: userId,
        signal: data
      };
      this.sendVoiceSignal(signalData);
    });
    
    peer.on('stream', stream => {
      // Add remote stream to UI
      const audioElement = document.createElement('audio');
      audioElement.id = `audio-${userId}`;
      audioElement.srcObject = stream;
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);
    });
    
    peer.on('close', () => {
      this.destroyPeer(userId);
    });
    
    peer.on('error', err => {
      console.error('Peer connection error:', err);
      this.destroyPeer(userId);
    });
    
    this.peers[userId] = peer;
    return peer;
  }
  
  // Handle an incoming WebRTC offer
  handleOffer(data) {
    const { from, signal } = data;
    let peer = this.peers[from.id];
    
    if (!peer) {
      peer = this.createPeer(from.id, false);
    }
    
    peer.signal(signal);
  }
  
  // Handle an incoming WebRTC answer
  handleAnswer(data) {
    const { from, signal } = data;
    const peer = this.peers[from.id];
    
    if (peer) {
      peer.signal(signal);
    }
  }
  
  // Handle ICE candidate
  handleIceCandidate(data) {
    const { from, signal } = data;
    const peer = this.peers[from.id];
    
    if (peer) {
      peer.signal(signal);
    }
  }
  
  // Send WebRTC signaling data
  sendVoiceSignal(data) {
    if (this.voiceSocket && this.voiceSocket.readyState === WebSocket.OPEN) {
      this.voiceSocket.send(JSON.stringify(data));
    }
  }
  
  // Destroy a peer connection
  destroyPeer(userId) {
    if (this.peers[userId]) {
      this.peers[userId].destroy();
      delete this.peers[userId];
      
      // Remove audio element
      const audioElement = document.getElementById(`audio-${userId}`);
      if (audioElement) {
        audioElement.remove();
      }
    }
  }
  
  // Destroy all peer connections
  destroyAllPeers() {
    Object.keys(this.peers).forEach(peerId => {
      this.destroyPeer(peerId);
    });
  }

  // Disconnect from text channel
  disconnectFromChannel() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.currentChannel = null;
    }
  }
  
  // Disconnect from voice channel
  disconnectFromVoiceChannel() {
    if (this.voiceSocket) {
      this.voiceSocket.close();
      this.voiceSocket = null;
      this.currentVoiceChannel = null;
      this.destroyAllPeers();
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }

  // Set message callback
  onMessage(callback) {
    this.callbacks.onMessage = callback;
  }

  // Set user joined callback
  onUserJoined(callback) {
    this.callbacks.onUserJoined = callback;
  }

  // Set user left callback
  onUserLeft(callback) {
    this.callbacks.onUserLeft = callback;
  }
  
  // Set voice users callback
  onVoiceUsers(callback) {
    this.callbacks.onVoiceUsers = callback;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
