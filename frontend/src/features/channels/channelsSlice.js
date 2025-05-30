import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { channelService } from '../../services/api';

const initialState = {
  channels: [],
  currentChannel: null,
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchChannels = createAsyncThunk(
  'channels/fetchChannels',
  async (serverId, { rejectWithValue }) => {
    try {
      return await channelService.getChannels(serverId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Kanallar yüklenemedi'
      );
    }
  }
);

export const fetchChannelById = createAsyncThunk(
  'channels/fetchChannelById',
  async (channelId, { rejectWithValue }) => {
    try {
      return await channelService.getChannel(channelId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Kanal bilgisi alınamadı'
      );
    }
  }
);

export const createChannel = createAsyncThunk(
  'channels/createChannel',
  async (channelData, { rejectWithValue }) => {
    try {
      return await channelService.createChannel(channelData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Kanal oluşturulamadı'
      );
    }
  }
);

export const updateChannel = createAsyncThunk(
  'channels/updateChannel',
  async ({ id, channelData }, { rejectWithValue }) => {
    try {
      return await channelService.updateChannel(id, channelData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Kanal güncellenemedi'
      );
    }
  }
);

export const deleteChannel = createAsyncThunk(
  'channels/deleteChannel',
  async (channelId, { rejectWithValue }) => {
    try {
      await channelService.deleteChannel(channelId);
      return channelId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Kanal silinemedi'
      );
    }
  }
);

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setCurrentChannel: (state, action) => {
      state.currentChannel = action.payload;
    },
    resetChannelStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearChannels: (state) => {
      state.channels = [];
      state.currentChannel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch channels
      .addCase(fetchChannels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.channels = action.payload;
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch channel by ID
      .addCase(fetchChannelById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChannelById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentChannel = action.payload;
      })
      .addCase(fetchChannelById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create channel
      .addCase(createChannel.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.channels.push(action.payload);
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update channel
      .addCase(updateChannel.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateChannel.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.channels.findIndex(
          (channel) => channel.id === action.payload.id
        );
        if (index !== -1) {
          state.channels[index] = action.payload;
        }
        if (state.currentChannel?.id === action.payload.id) {
          state.currentChannel = action.payload;
        }
      })
      .addCase(updateChannel.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Delete channel
      .addCase(deleteChannel.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteChannel.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.channels = state.channels.filter(
          (channel) => channel.id !== action.payload
        );
        if (state.currentChannel?.id === action.payload) {
          state.currentChannel = null;
        }
      })
      .addCase(deleteChannel.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setCurrentChannel, resetChannelStatus, clearChannels } = 
  channelsSlice.actions;

// Selectors
export const selectAllChannels = (state) => state.channels.channels;
export const selectTextChannels = (state) => 
  state.channels.channels.filter(channel => channel.type === 'text');
export const selectVoiceChannels = (state) => 
  state.channels.channels.filter(channel => channel.type === 'voice');
export const selectCurrentChannel = (state) => state.channels.currentChannel;
export const selectChannelStatus = (state) => state.channels.status;
export const selectChannelError = (state) => state.channels.error;

export default channelsSlice.reducer;
