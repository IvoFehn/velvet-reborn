import { apiClient } from './client';

export const miscApi = {
  // Daily login operations
  dailyLogin: {
    claim: (signal?: AbortSignal) => {
      return apiClient.get('/daily-login', undefined, signal);
    },
    
    claimLootbox: (signal?: AbortSignal) => {
      return apiClient.post('/daily-login/calim-lootbox', {}, signal);
    }
  },

  // Shop operations
  shop: {
    buy: (data: { itemId: string; quantity?: number }, signal?: AbortSignal) => {
      return apiClient.post('/shop/buy', data, signal);
    }
  },

  // Coin book operations
  coinBook: {
    list: (signal?: AbortSignal) => {
      return apiClient.get('/coinbooks', undefined, signal);
    },
    
    create: (data: any, signal?: AbortSignal) => {
      return apiClient.post('/coinbooks', data, signal);
    }
  },

  // Coin items operations
  coinItems: {
    list: (signal?: AbortSignal) => {
      return apiClient.get('/coinitems', undefined, signal);
    },
    
    create: (data: any, signal?: AbortSignal) => {
      return apiClient.post('/coinitems', data, signal);
    }
  },

  // Items operations
  items: {
    list: (signal?: AbortSignal) => {
      return apiClient.get('/items', undefined, signal);
    },
    
    create: (data: any, signal?: AbortSignal) => {
      return apiClient.post('/items/create', data, signal);
    }
  },

  // Level thresholds
  levelThresholds: {
    get: (signal?: AbortSignal) => {
      return apiClient.get('/level-thresholds', undefined, signal);
    },
    
    update: (data: any, signal?: AbortSignal) => {
      return apiClient.put('/level-thresholds', data, signal);
    }
  },

  // Lootbox operations
  lootbox: {
    get: (signal?: AbortSignal) => {
      return apiClient.get('/lootbox', undefined, signal);
    },
    
    add: (data: any, signal?: AbortSignal) => {
      return apiClient.post('/lootbox/add', data, signal);
    }
  },

  // News operations
  news: {
    list: (signal?: AbortSignal) => {
      return apiClient.get('/news', undefined, signal);
    },
    
    create: (data: any, signal?: AbortSignal) => {
      return apiClient.post('/news', data, signal);
    }
  },

  // Wiki operations
  wiki: {
    list: (signal?: AbortSignal) => {
      return apiClient.get('/wiki', undefined, signal);
    },
    
    get: (id: string, signal?: AbortSignal) => {
      return apiClient.get(`/wiki/${id}`, undefined, signal);
    },
    
    create: (data: any, signal?: AbortSignal) => {
      return apiClient.post('/wiki', data, signal);
    },
    
    update: (id: string, data: any, signal?: AbortSignal) => {
      return apiClient.put(`/wiki/${id}`, data, signal);
    }
  },

  // Spin operations
  spin: {
    execute: (signal?: AbortSignal) => {
      return apiClient.post('/spin', {}, signal);
    }
  },

  // Telegram operations
  telegram: {
    send: (data: { message: string; chatId?: string }, signal?: AbortSignal) => {
      return apiClient.post('/telegram', data, signal);
    },
    
    sendMessage: (data: { message: string; chatId?: string }, signal?: AbortSignal) => {
      return apiClient.post('/sendMessage', data, signal);
    }
  },

  // Gold weights
  goldWeights: {
    get: (signal?: AbortSignal) => {
      return apiClient.get('/goldWeights', undefined, signal);
    },
    
    update: (data: any, signal?: AbortSignal) => {
      return apiClient.put('/goldWeights', data, signal);
    }
  }
};