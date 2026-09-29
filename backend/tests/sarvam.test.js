import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSarvamApiKey, isSarvamConfigured, callSarvamChat } from '../services/sarvamService.js';

describe('Sarvam AI Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('detects when SARVAM_API_KEY is not configured', () => {
    delete process.env.SARVAM_API_KEY;
    delete process.env.SARVAM_105B_API_KEY;
    delete process.env.SARVAM_KEY;

    expect(isSarvamConfigured()).toBe(false);
    expect(getSarvamApiKey()).toBe('');
  });

  it('detects when SARVAM_API_KEY is configured', () => {
    process.env.SARVAM_API_KEY = 'test-sarvam-key-123';
    expect(isSarvamConfigured()).toBe(true);
    expect(getSarvamApiKey()).toBe('test-sarvam-key-123');
  });

  it('throws descriptive error if callSarvamChat is called without API key', async () => {
    delete process.env.SARVAM_API_KEY;
    delete process.env.SARVAM_105B_API_KEY;
    delete process.env.SARVAM_KEY;

    await expect(
      callSarvamChat({ systemPrompt: 'Test', messages: [{ role: 'user', text: 'Hi' }] })
    ).rejects.toThrow(/Sarvam API key is not configured/);
  });

  it('formats payload and sends correct headers to Sarvam API', async () => {
    process.env.SARVAM_API_KEY = 'mock-key-abc';

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ reply: 'Namaste! MilQuu Fresh is running smoothly.', action: 'none' })
          }
        }
      ]
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await callSarvamChat({
      systemPrompt: 'You are MilQuu AI',
      messages: [{ role: 'user', text: 'How are sales today?' }]
    });

    expect(result.text).toContain('Namaste!');
    expect(result.modelUsed).toBe('sarvam-105b-conversations');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.sarvam.ai/v1/chat/completions');
    expect(options.headers['api-subscription-key']).toBe('mock-key-abc');
    expect(options.headers['Authorization']).toBe('Bearer mock-key-abc');

    const body = JSON.parse(options.body);
    expect(body.model).toBe('sarvam-105b-conversations');
    expect(body.messages[0]).toEqual({ role: 'system', content: 'You are MilQuu AI' });
    expect(body.messages[1]).toEqual({ role: 'user', content: 'How are sales today?' });
  });

  it('falls back to sarvam-105b if conversational model returns 404', async () => {
    process.env.SARVAM_API_KEY = 'mock-key-abc';

    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(async (url, options) => {
      callCount++;
      const body = JSON.parse(options.body);
      if (body.model === 'sarvam-105b-conversations') {
        return {
          ok: false,
          status: 404,
          text: async () => 'Model not found'
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: 'Fallback response from flagship 105b' } }]
        })
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await callSarvamChat({
      systemPrompt: 'System',
      messages: [{ role: 'user', text: 'Hi' }]
    });

    expect(callCount).toBe(2);
    expect(result.modelUsed).toBe('sarvam-105b');
    expect(result.text).toBe('Fallback response from flagship 105b');
  });
});
