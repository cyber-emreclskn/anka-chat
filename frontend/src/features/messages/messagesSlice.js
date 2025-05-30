import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageService } from '../../services/api';

const initialState = {
  messages: [],
  status: 'idle',
  error: null,
  hasMore: true,
  voiceUsers: [],
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ channelId, limit = 50, offset = 0 }, { rejectWithValue }) => {
    try {
      return await messageService.getMessages(channelId, limit, offset);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Mesajlar yüklenemedi'
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      return await messageService.createMessage(messageData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Mesaj gönderilemedi'
      );
    }
  }
);

export const updateMessage = createAsyncThunk(
  'messages/updateMessage',
  async ({ id, messageData }, { rejectWithValue }) => {
    try {
      return await messageService.updateMessage(id, messageData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Mesaj güncellenemedi'
      );
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await messageService.deleteMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Mesaj silinemedi'
      );
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    resetMessageStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.hasMore = true;
    },
    addMessage: (state, action) => {
      // Add a new message from WebSocket
      const exists = state.messages.find(msg => msg.id === action.payload.id);
      if (!exists) {
        state.messages.unshift(action.payload);
      }
    },
    updateMessageInState: (state, action) => {
      // Update a message from WebSocket
      const index = state.messages.findIndex(
        (message) => message.id === action.payload.id
      );
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    deleteMessageFromState: (state, action) => {
      // Remove a message from WebSocket notification
      state.messages = state.messages.filter(
        (message) => message.id !== action.payload
      );
    },
    setVoiceUsers: (state, action) => {
      state.voiceUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.length < 50) {
          state.hasMore = false;
        }
        // Append messages - we avoid duplicates by checking IDs
        const newMessages = action.payload.filter(
          (message) => !state.messages.some((m) => m.id === message.id)
        );
        state.messages = [...state.messages, ...newMessages];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The actual message will be added via WebSocket in real-time
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update message
      .addCase(updateMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.messages.findIndex(
          (message) => message.id === action.payload.id
        );
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      .addCase(updateMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Delete message
      .addCase(deleteMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = state.messages.filter(
          (message) => message.id !== action.payload
        );
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  resetMessageStatus,
  clearMessages,
  addMessage,
  updateMessageInState,
  deleteMessageFromState,
  setVoiceUsers,
} = messagesSlice.actions;

// Selectors
export const selectAllMessages = (state) => state.messages.messages;
export const selectMessageStatus = (state) => state.messages.status;
export const selectMessageError = (state) => state.messages.error;
export const selectHasMoreMessages = (state) => state.messages.hasMore;
export const selectVoiceUsers = (state) => state.messages.voiceUsers;

export default messagesSlice.reducer;
