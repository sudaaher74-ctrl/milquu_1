import logger from '../utils/logger.js';

const SARVAM_CHAT_URL = 'https://api.sarvam.ai/v1/chat/completions';
const DEFAULT_MODEL = 'sarvam-105b-conversations';
const FALLBACK_MODEL = 'sarvam-105b';

/**
 * Retrieves the Sarvam API key from environment variables.
 * Supports multiple common naming variants.
 */
export const getSarvamApiKey = () => {
  return (
    process.env.SARVAM_API_KEY ||
    process.env.SARVAM_105B_API_KEY ||
    process.env.SARVAM_KEY ||
    ''
  ).trim();
};

/**
 * Checks if Sarvam API key is configured.
 */
export const isSarvamConfigured = () => {
  return Boolean(getSarvamApiKey());
};

/**
 * Calls Sarvam 105B chat completion endpoint.
 *
 * @param {Object} options
 * @param {string} options.systemPrompt - System instruction describing assistant persona and context
 * @param {Array<{role: string, text?: string, content?: string}>} options.messages - Chat message history
 * @param {string} [options.model] - Model name (defaults to sarvam-105b-conversations)
 * @param {number} [options.temperature=0.3] - Temperature
 * @param {number} [options.maxTokens=1024] - Max output tokens
 * @returns {Promise<{text: string, modelUsed: string}>}
 */
export const callSarvamChat = async ({
  systemPrompt,
  messages = [],
  model = process.env.SARVAM_MODEL || DEFAULT_MODEL,
  temperature = 0.3,
  maxTokens = 1024
}) => {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    throw new Error('Sarvam API key is not configured in environment (SARVAM_API_KEY)');
  }

  // Format messages into standard OpenAI format
  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }

  messages.forEach((m) => {
    const role = (m.role === 'assistant' || m.role === 'model') ? 'assistant' : 'user';
    const content = String(m.text || m.content || '').trim();
    if (content) {
      formattedMessages.push({ role, content });
    }
  });

  const headers = {
    'Content-Type': 'application/json',
    'api-subscription-key': apiKey,
    'Authorization': `Bearer ${apiKey}`
  };

  const tryRequest = async (modelToUse) => {
    const payload = {
      model: modelToUse,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens
    };

    const res = await fetch(SARVAM_CHAT_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorBody = await res.text();
      const err = new Error(`Sarvam API request failed with status ${res.status}: ${errorBody}`);
      err.status = res.status;
      err.body = errorBody;
      throw err;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return { text: content.trim(), modelUsed: modelToUse };
  };

  try {
    return await tryRequest(model);
  } catch (primaryError) {
    // If the conversation-specific model is not found, fallback to flagship sarvam-105b
    if (model !== FALLBACK_MODEL && (primaryError.status === 404 || primaryError.status === 400)) {
      logger.warn(`[Sarvam] Model ${model} failed, attempting fallback to ${FALLBACK_MODEL}`);
      return await tryRequest(FALLBACK_MODEL);
    }
    throw primaryError;
  }
};
