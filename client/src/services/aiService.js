import api from './api';

export const aiService = {
  summarize: async (text, options = {}) => {
    const res = await api.post('/ai/summarize', { text, options });
    return res.data;
  },

  classify: async (text) => {
    const res = await api.post('/ai/classify', { text });
    return res.data;
  },

  getRecommendations: async (context = {}) => {
    const res = await api.post('/ai/recommendations', context);
    return res.data;
  },

  chat: async (message, chatHistory = []) => {
    const res = await api.post('/ai/chat', { message, chatHistory });
    return res.data;
  },
};

export default aiService;
