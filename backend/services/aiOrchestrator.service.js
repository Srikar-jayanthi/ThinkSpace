'use strict';

/**
 * @fileoverview AI Orchestrator — central brain for ThinkSpace Practice responses.
 *
 * Responsibilities:
 *   - Provider selection based on language and availability
 *   - Cascading failover chain with automatic fallback
 *   - Multilingual routing (Indian languages → Sarvam AI first)
 *   - Streaming response coordination
 *   - Provider health monitoring
 *   - Built-in ThinkSpace Coach fallback for zero-configuration resilience
 *
 * Failover Chain:
 *   Indian Languages → Sarvam AI → Groq → OpenAI → Ollama → ThinkSpace Coach
 *   English/Other    → Groq → OpenAI → Ollama → ThinkSpace Coach
 *
 * @module services/aiOrchestrator.service
 */

const { getProvider, getAvailableProviders, getProviderStatus } = require('../providers');

/** Indian language codes that should route to Sarvam AI first */
const INDIAN_LANGUAGES = new Set([
  'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur',
]);

/**
 * Determine the optimal provider ordering for a given practice session.
 *
 * @param {string} langCode — ISO 639-1 language code
 * @returns {string[]} — ordered list of provider keys to try
 */
function getProviderChain(langCode) {
  const isIndian = INDIAN_LANGUAGES.has(langCode);

  if (isIndian) {
    return ['sarvam', 'groq', 'openai', 'ollama', 'coach'];
  }

  return ['groq', 'openai', 'ollama', 'coach'];
}

/**
 * Stream a practice response using the cascading provider chain.
 *
 * Tries each provider in order based on the practice language.
 * Falls back to the next provider on failure.
 *
 * @param {Object} session — practice session object
 * @param {string} userArgument — user's latest argument text
 * @yields {string} text chunks from the AI response
 * @throws {Error} if all providers fail
 */
async function* streamResponse(session, userArgument) {
  const lang = session.currentLanguage || 'en';
  const chain = getProviderChain(lang);

  for (const providerKey of chain) {
    const provider = getProvider(providerKey);
    if (!provider || !provider.isAvailable()) continue;

    // Skip Sarvam for non-Indian languages
    if (providerKey === 'sarvam' && !provider.supportsLanguage(lang)) continue;

    console.log(`[ORCHESTRATOR] Trying ${provider.getName()} (lang: ${lang})`); // eslint-disable-line no-console

    try {
      // For streaming providers (Ollama, Coach)
      if (providerKey === 'ollama' || providerKey === 'coach') {
        yield* provider.stream(session, userArgument);
        return;
      }

      const response = await provider.generate(session, userArgument);
      if (response) {
        yield response;
        return;
      }

      console.warn(`[ORCHESTRATOR] ${provider.getName()} returned empty — trying next`); // eslint-disable-line no-console
    } catch (e) {
      console.error(`[ORCHESTRATOR] ${provider.getName()} failed: ${e.message}`); // eslint-disable-line no-console
      // Continue to next provider in failover chain
    }
  }

  // Safety net fallback
  const coach = getProvider('coach');
  if (coach) {
    yield* coach.stream(session, userArgument);
    return;
  }

  throw new Error('All AI services failed. Please check your network or configuration.');
}

/**
 * Get the health status of all AI providers.
 * Used by the /api/ai/status monitoring endpoint.
 *
 * @returns {Object} provider status summary
 */
function getAIStatus() {
  const providers = getProviderStatus();
  const available = providers.filter(p => p.available);

  return {
    status: available.length > 0 ? 'operational' : 'degraded',
    totalProviders: providers.length,
    availableProviders: available.length,
    providers,
    failoverChain: {
      english: getProviderChain('en'),
      indian: getProviderChain('hi'),
    },
  };
}

module.exports = {
  streamResponse,
  getProviderChain,
  getAIStatus,
  INDIAN_LANGUAGES,
};
