import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serverService } from '../../services/api';

const initialState = {
  servers: [],
  currentServer: null,
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchServers = createAsyncThunk(
  'servers/fetchServers',
  async (_, { rejectWithValue }) => {
    try {
      return await serverService.getServers();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Sunucular yüklenemedi'
      );
    }
  }
);

export const fetchServerById = createAsyncThunk(
  'servers/fetchServerById',
  async (serverId, { rejectWithValue }) => {
    try {
      return await serverService.getServer(serverId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Sunucu bilgisi alınamadı'
      );
    }
  }
);

export const createServer = createAsyncThunk(
  'servers/createServer',
  async (serverData, { rejectWithValue }) => {
    try {
      return await serverService.createServer(serverData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Sunucu oluşturulamadı'
      );
    }
  }
);

export const updateServer = createAsyncThunk(
  'servers/updateServer',
  async ({ id, serverData }, { rejectWithValue }) => {
    try {
      return await serverService.updateServer(id, serverData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Sunucu güncellenemedi'
      );
    }
  }
);

export const deleteServer = createAsyncThunk(
  'servers/deleteServer',
  async (serverId, { rejectWithValue }) => {
    try {
      await serverService.deleteServer(serverId);
      return serverId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Sunucu silinemedi'
      );
    }
  }
);

const serversSlice = createSlice({
  name: 'servers',
  initialState,
  reducers: {
    setCurrentServer: (state, action) => {
      state.currentServer = action.payload;
    },
    resetServerStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch servers
      .addCase(fetchServers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.servers = action.payload;
      })
      .addCase(fetchServers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch server by ID
      .addCase(fetchServerById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServerById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentServer = action.payload;
      })
      .addCase(fetchServerById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create server
      .addCase(createServer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createServer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.servers.push(action.payload);
      })
      .addCase(createServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update server
      .addCase(updateServer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateServer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.servers.findIndex(
          (server) => server.id === action.payload.id
        );
        if (index !== -1) {
          state.servers[index] = action.payload;
        }
        if (state.currentServer?.id === action.payload.id) {
          state.currentServer = action.payload;
        }
      })
      .addCase(updateServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Delete server
      .addCase(deleteServer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteServer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.servers = state.servers.filter(
          (server) => server.id !== action.payload
        );
        if (state.currentServer?.id === action.payload) {
          state.currentServer = null;
        }
      })
      .addCase(deleteServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setCurrentServer, resetServerStatus } = serversSlice.actions;

// Selectors
export const selectAllServers = (state) => state.servers.servers;
export const selectCurrentServer = (state) => state.servers.currentServer;
export const selectServerStatus = (state) => state.servers.status;
export const selectServerError = (state) => state.servers.error;

export default serversSlice.reducer;
