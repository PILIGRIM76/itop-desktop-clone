// ========================================
// AI Configuration & API Settings
// ========================================

const AI_CONFIG = {
  // OpenAI API Settings
  openai: {
    apiKey: '', // User can set their own key
    baseUrl: 'https://api.openai.com/v1',
    models: {
      gpt4: 'gpt-4',
      gpt35: 'gpt-3.5-turbo',
      gpt4Turbo: 'gpt-4-turbo-preview'
    }
  },

  // Anthropic Claude API Settings
  anthropic: {
    apiKey: '', // User can set their own key
    baseUrl: 'https://api.anthropic.com',
    models: {
      claude3Opus: 'claude-3-opus-20240229',
      claude3Sonnet: 'claude-3-sonnet-20240229',
      claude3Haiku: 'claude-3-haiku-20240307'
    }
  },

  // Google Gemini API Settings
  google: {
    apiKey: '', // User can set their own key
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: {
      geminiPro: 'gemini-pro',
      geminiProVision: 'gemini-pro-vision'
    }
  },

  // Default settings
  defaultProvider: 'openai',
  defaultModel: 'gpt-3.5-turbo',

  // Request settings
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 30000, // 30 seconds

  // System prompt for ChatAI
  systemPrompt: `You are a helpful AI assistant integrated into iTop Easy Desktop - a Windows desktop organization application. 
Help users with their questions about desktop organization, file management, productivity, and general topics.
Be concise, friendly, and helpful. Keep responses focused and practical.`
};

// Store conversation history per user/session
const conversationHistory = new Map();

// Get conversation history
function getConversationHistory(sessionId) {
  if (!conversationHistory.has(sessionId)) {
    conversationHistory.set(sessionId, []);
  }
  return conversationHistory.get(sessionId);
}

// Add message to history
function addMessageToHistory(sessionId, role, content) {
  const history = getConversationHistory(sessionId);
  history.push({ role, content, timestamp: Date.now() });
  
  // Keep only last 20 messages to avoid memory issues
  if (history.length > 20) {
    history.shift();
  }
}

// Clear conversation history
function clearHistory(sessionId) {
  if (sessionId) {
    conversationHistory.delete(sessionId);
  } else {
    conversationHistory.clear();
  }
}

// Validate API key format
function isValidOpenAIKey(key) {
  return key && (key.startsWith('sk-') || key.startsWith('sk-proj'));
}

function isValidAnthropicKey(key) {
  return key && key.startsWith('sk-ant-');
}

function isValidGoogleKey(key) {
  return key && key.length > 20;
}

// Store API keys securely (in memory only, not persisted)
let storedApiKeys = {
  openai: null,
  anthropic: null,
  google: null
};

function setApiKey(provider, key) {
  if (storedApiKeys.hasOwnProperty(provider)) {
    storedApiKeys[provider] = key;
    return true;
  }
  return false;
}

function getApiKey(provider) {
  return storedApiKeys[provider] || null;
}

// Get AI configuration
function getAIConfig() {
  return {
    defaultProvider: AI_CONFIG.defaultProvider,
    defaultModel: AI_CONFIG.defaultModel,
    maxTokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature,
    availableModels: {
      openai: Object.values(AI_CONFIG.openai.models),
      anthropic: Object.values(AI_CONFIG.anthropic.models),
      google: Object.values(AI_CONFIG.google.models)
    }
  };
}

// Update AI configuration
function updateAIConfig(updates) {
  if (updates.defaultProvider) AI_CONFIG.defaultProvider = updates.defaultProvider;
  if (updates.defaultModel) AI_CONFIG.defaultModel = updates.defaultModel;
  if (updates.maxTokens) AI_CONFIG.maxTokens = updates.maxTokens;
  if (updates.temperature !== undefined) AI_CONFIG.temperature = updates.temperature;
  return true;
}

module.exports = {
  AI_CONFIG,
  getConversationHistory,
  addMessageToHistory,
  clearHistory,
  isValidOpenAIKey,
  isValidAnthropicKey,
  isValidGoogleKey,
  setApiKey,
  getApiKey,
  getAIConfig,
  updateAIConfig
};
