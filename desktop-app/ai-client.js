// ========================================
// AI API Client Module
// Handles requests to OpenAI, Anthropic, Google
// ========================================

const axios = require('axios');
const { AI_CONFIG, getApiKey, getConversationHistory, addMessageToHistory } = require('./ai-config');

// Create axios instances for each provider
const openaiClient = axios.create({
  timeout: AI_CONFIG.timeout
});

const anthropicClient = axios.create({
  timeout: AI_CONFIG.timeout
});

const googleClient = axios.create({
  timeout: AI_CONFIG.timeout
});

// ========================================
// OpenAI API Handler
// ========================================
async function chatWithOpenAI(messages, options = {}) {
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    throw new Error('OpenAI API key not set');
  }

  const model = options.model || AI_CONFIG.defaultModel || 'gpt-3.5-turbo';
  
  try {
    const response = await openaiClient.post(
      `${AI_CONFIG.openai.baseUrl}/chat/completions`,
      {
        model: model,
        messages: messages,
        max_tokens: options.maxTokens || AI_CONFIG.maxTokens,
        temperature: options.temperature || AI_CONFIG.temperature,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      content: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: model
    };
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// ========================================
// Anthropic Claude API Handler
// ========================================
async function chatWithAnthropic(messages, options = {}) {
  const apiKey = getApiKey('anthropic');
  
  if (!apiKey) {
    throw new Error('Anthropic API key not set');
  }

  const model = options.model || AI_CONFIG.anthropic.models.claude3Sonnet;
  
  // Convert OpenAI-style messages to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  
  // Anthropic expects messages in specific format
  const anthropicMessages = userMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content
  }));

  try {
    const response = await anthropicClient.post(
      `${AI_CONFIG.anthropic.baseUrl}/v1/messages`,
      {
        model: model,
        max_tokens: options.maxTokens || AI_CONFIG.maxTokens,
        system: systemMessage?.content || AI_CONFIG.systemPrompt,
        messages: anthropicMessages
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      content: response.data.content[0].text,
      usage: response.data.usage,
      model: model
    };
  } catch (error) {
    console.error('Anthropic API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// ========================================
// Google Gemini API Handler
// ========================================
async function chatWithGoogle(messages, options = {}) {
  const apiKey = getApiKey('google');
  
  if (!apiKey) {
    throw new Error('Google API key not set');
  }

  const model = options.model || AI_CONFIG.google.models.geminiPro;
  
  // Convert OpenAI-style messages to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  // Add system prompt as first user message if exists
  const systemMessage = messages.find(m => m.role === 'system');
  if (systemMessage) {
    contents.unshift({
      role: 'user',
      parts: [{ text: systemMessage.content + '\n\n' + (contents[0]?.parts[0]?.text || '') }]
    });
  }

  try {
    const response = await googleClient.post(
      `${AI_CONFIG.google.baseUrl}/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: contents,
        generationConfig: {
          maxOutputTokens: options.maxTokens || AI_CONFIG.maxTokens,
          temperature: options.temperature || AI_CONFIG.temperature
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      content: response.data.candidates[0].content.parts[0].text,
      model: model
    };
  } catch (error) {
    console.error('Google API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// ========================================
// Universal Chat Function
// Automatically routes to correct provider
// ========================================
async function chatWithAI(provider, messages, options = {}) {
  switch (provider) {
    case 'openai':
      return await chatWithOpenAI(messages, options);
    case 'anthropic':
      return await chatWithAnthropic(messages, options);
    case 'google':
      return await chatWithGoogle(messages, options);
    default:
      // Default to OpenAI
      return await chatWithOpenAI(messages, options);
  }
}

// ========================================
// Quick Chat Helper
// For simple one-off questions
// ========================================
async function quickChat(provider, userMessage, sessionId = 'default') {
  const history = getConversationHistory(sessionId);
  
  const messages = [
    { role: 'system', content: AI_CONFIG.systemPrompt },
    ...history,
    { role: 'user', content: userMessage }
  ];

  const result = await chatWithAI(provider, messages);

  if (result.success) {
    addMessageToHistory(sessionId, 'user', userMessage);
    addMessageToHistory(sessionId, 'assistant', result.content);
  }

  return result;
}

// ========================================
// Image Analysis (for screenshot AI enhancement)
// ========================================
async function analyzeImage(provider, base64Image, prompt = 'Describe this image') {
  // Only OpenAI GPT-4 Vision and Google Gemini support image analysis
  if (provider === 'openai') {
    const apiKey = getApiKey('openai');
    if (!apiKey) {
      throw new Error('OpenAI API key not set');
    }

    try {
      const response = await openaiClient.post(
        `${AI_CONFIG.openai.baseUrl}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
              ]
            }
          ],
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        content: response.data.choices[0].message.content
      };
    } catch (error) {
      console.error('OpenAI Vision Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  } else if (provider === 'google') {
    const apiKey = getApiKey('google');
    if (!apiKey) {
      throw new Error('Google API key not set');
    }

    try {
      const response = await googleClient.post(
        `${AI_CONFIG.google.baseUrl}/models/gemini-pro-vision:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/png', data: base64Image } }
            ]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        content: response.data.candidates[0].content.parts[0].text
      };
    } catch (error) {
      console.error('Google Vision Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  return {
    success: false,
    error: 'Image analysis not supported for this provider'
  };
}

module.exports = {
  chatWithAI,
  chatWithOpenAI,
  chatWithAnthropic,
  chatWithGoogle,
  quickChat,
  analyzeImage
};
