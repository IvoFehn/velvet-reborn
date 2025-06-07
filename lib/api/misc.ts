import { apiClient } from './client';
import { 
  ShopBuyPayload, 
  CreateCoinBookPayload, 
  CreateCoinItemPayload, 
  CreateItemPayload, 
  LevelThresholdsPayload, 
  AddLootboxPayload, 
  CreateWikiPagePayload, 
  UpdateWikiPagePayload, 
  TelegramMessagePayload, 
  GoldWeightsPayload,
  CreateNewsPayload
} from './types';

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
    buy: (data: ShopBuyPayload, signal?: AbortSignal) => {
      return apiClient.post('/shop/buy', data, signal);
    }
  },

  // Coin book operations
  coinBook: {
    list: (signal?: AbortSignal) => {
      return apiClient.get('/coinbooks', undefined, signal);
    },
    
    create: (data: CreateCoinBookPayload, signal?: AbortSignal) => {
      return apiClient.post('/coinbooks', data, signal);
    }
  },

  // Coin items operations
  coinItems: {
    list: (signal?: AbortSignal) => {
      return apiClient.get('/coinitems', undefined, signal);
    },
    
    create: (data: CreateCoinItemPayload, signal?: AbortSignal) => {
      return apiClient.post('/coinitems', data, signal);
    }
  },

  // Items operations
  items: {
    list: (signal?: AbortSignal) => {
      return apiClient.get('/items', undefined, signal);
    },
    
    create: (data: CreateItemPayload, signal?: AbortSignal) => {
      return apiClient.post('/items/create', data, signal);
    }
  },

  // Level thresholds
  levelThresholds: {
    get: (signal?: AbortSignal) => {
      return apiClient.get('/level-thresholds', undefined, signal);
    },
    
    update: (data: LevelThresholdsPayload, signal?: AbortSignal) => {
      return apiClient.put('/level-thresholds', data, signal);
    }
  },

  // Lootbox operations
  lootbox: {
    get: (signal?: AbortSignal) => {
      return apiClient.get('/lootbox', undefined, signal);
    },
    
    add: (data: AddLootboxPayload, signal?: AbortSignal) => {
      return apiClient.post('/lootbox/add', data, signal);
    }
  },

  // News operations
  news: {
    list: (signal?: AbortSignal) => {
      return apiClient.get('/news', undefined, signal);
    },
    
    create: (data: CreateNewsPayload, signal?: AbortSignal) => {
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
    
    create: (data: CreateWikiPagePayload, signal?: AbortSignal) => {
      return apiClient.post('/wiki', data, signal);
    },
    
    update: (id: string, data: UpdateWikiPagePayload, signal?: AbortSignal) => {
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
    send: (data: TelegramMessagePayload, signal?: AbortSignal) => {
      return apiClient.post('/telegram', data, signal);
    },
    
    sendMessage: (data: TelegramMessagePayload, signal?: AbortSignal) => {
      return apiClient.post('/sendMessage', data, signal);
    }
  },

  // Gold weights
  goldWeights: {
    get: (signal?: AbortSignal) => {
      return apiClient.get('/goldWeights', undefined, signal);
    },
    
    update: (data: GoldWeightsPayload, signal?: AbortSignal) => {
      return apiClient.put('/goldWeights', data, signal);
    }
  }
};