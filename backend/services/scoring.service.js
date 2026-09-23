'use strict';

/**
 * @fileoverview Scoring service — wraps ML scorer and manages argument quality tracking.
 *
 * Integrates with the Python FastAPI ML service (/scorer/score) to evaluate
 * debate arguments across three dimensions:
 *   - Logic (0-100): causal structure, reasoning markers
 *   - Evidence (0-100): statistics, citations, examples
 *   - Clarity (0-100): readability, sentence structure, vocabulary
 *
 * Also provides local score aggregation for debate summaries and trends.
 *
 * @module services/scoring.service
 */

const axios = require('axios');

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const GREETING_REGEX = /^(hello|hi|hey|greetings|good\s+(morning|afternoon|evening)|howdy|sup|yo|test|testing|are\s+you\s+ready|ready\??)[\s!.,?]*$/i;

function isGreetingOrNonArgument(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return true;
  return GREETING_REGEX.test(trimmed);
}

/**
 * Score a debate argument via the ML service.
 *
 * @param {Object} params
 * @param {string} params.argument — the argument text to score
 * @param {string} params.topic — debate topic for context
 * @param {string[]} [params.context] — previous arguments for context
 * @param {number} [params.turnNumber] — current turn number
 * @returns {Promise<Object>} scores { logic, evidence, clarity, overall, feedback, sentiment }
 */
async function scoreArgument({ argument, topic, context = [], turnNumber = 1 }) {
  if (isGreetingOrNonArgument(argument)) {
    return {
      logic: null,
      evidence: null,
      clarity: null,
      overall: null,
      isGreeting: true,
      feedback: {
        logic: 'Greeting received. Present your opening thesis or argument on the topic to receive reasoning feedback.',
        evidence: 'Waiting for your opening claim or evidence on the topic.',
        clarity: 'Greeting acknowledged.',
      },
      sentiment: { compound: 0, pos: 1, neu: 0, neg: 0 },
    };
  }

  try {
    const response = await axios.post(`${ML_BASE_URL}/scorer/score`, {
      argument,
      topic,
      context,
      turn_number: turnNumber,
    }, {
      timeout: 10_000,
      headers: {
        'X-ML-API-Key': process.env.ML_API_KEY,
      },
    });

    if (response.data?.is_greeting || response.data?.isGreeting) {
      return {
        logic: null,
        evidence: null,
        clarity: null,
        overall: null,
        isGreeting: true,
        feedback: response.data.feedback || {
          logic: 'Greeting received. Present your opening thesis or argument on the topic to receive reasoning feedback.',
          evidence: 'Waiting for your opening claim or evidence on the topic.',
          clarity: 'Greeting acknowledged.',
        },
        sentiment: response.data.sentiment || {},
      };
    }

    return response.data;
  } catch (e) {
    console.warn(`[SCORING] ML scorer unavailable: ${e.message}`); // eslint-disable-line no-console
    return _fallbackScore(argument);
  }
}

/**
 * Aggregate scores across multiple arguments.
 *
 * @param {Object[]} arguments — array of argument objects with scores
 * @returns {Object} average scores
 */
function aggregateScores(args) {
  const scored = args.filter(a => a.scores?.overall != null);
  if (scored.length === 0) return { logic: 0, evidence: 0, clarity: 0, overall: 0 };

  const avg = (field) => Math.round(
    scored.reduce((sum, a) => sum + (a.scores[field] || 0), 0) / scored.length
  );

  return {
    logic: avg('logic'),
    evidence: avg('evidence'),
    clarity: avg('clarity'),
    overall: avg('overall'),
  };
}

/**
 * Calculate score trend (improving, stable, declining) based on recent arguments.
 *
 * @param {Object[]} args — ordered array of scored arguments (oldest first)
 * @param {number} [windowSize=3] — comparison window
 * @returns {string} 'improving' | 'stable' | 'declining'
 */
function calculateTrend(args, windowSize = 3) {
  const scored = args.filter(a => a.scores?.overall != null);
  if (scored.length < windowSize * 2) return 'stable';

  const recent = scored.slice(-windowSize);
  const previous = scored.slice(-(windowSize * 2), -windowSize);

  const recentAvg = recent.reduce((s, a) => s + a.scores.overall, 0) / windowSize;
  const prevAvg = previous.reduce((s, a) => s + a.scores.overall, 0) / windowSize;

  if (recentAvg > prevAvg + 5) return 'improving';
  if (recentAvg < prevAvg - 5) return 'declining';
  return 'stable';
}

/**
 * Fallback scoring when ML service is unavailable.
 * Uses basic heuristics instead of the full NLP pipeline.
 */
/**
 * Intelligent heuristic scoring when ML microservice is initializing or unavailable.
 * Evaluates causal reasoning, evidence markers, and clarity structure.
 */
function _fallbackScore(argument) {
  const text = String(argument || '').trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // 1. Causal & deductive reasoning markers (Logic)
  const logicPatterns = [
    /\b(because|therefore|thus|hence|consequently|as a result|leads to|results in|due to)\b/gi,
    /\b(since|furthermore|moreover|on the other hand|however|conversely|in contrast)\b/gi,
    /\b(proves|demonstrates|implies|indicates|signifies|substantiates|validates)\b/gi,
    /\b(if\b.+\bthen\b)/gi,
    /\b(in order to|aims to|purpose is|objective)\b/gi,
    /\b(firstly|secondly|finally|in conclusion|ultimately)\b/gi,
  ];

  let logicHits = 0;
  logicPatterns.forEach((p) => {
    const matches = text.match(p);
    if (matches) logicHits += matches.length;
  });

  // Base logic score from 62 to 94 based on reasoning structure and sentence balance
  let logic = 62 + Math.min(20, logicHits * 7) + Math.min(12, sentenceCount * 3);
  if (wordCount < 6) logic = 45;
  else if (wordCount < 12) logic = Math.min(logic, 65);
  logic = Math.max(40, Math.min(95, Math.round(logic)));

  // 2. Evidence markers & empirical grounding (Evidence)
  const evidencePatterns = [
    /\b(\d+%|\d+\s*percent)\b/gi,
    /\b(study|studies|research|survey|report|data|statistics|analysis|findings)\b/gi,
    /\b(for example|for instance|such as|case in point|specifically|evidence)\b/gi,
    /\b(according to|cited by|published|source|expert|historically|in reality)\b/gi,
    /\b(\$\d+|\d+\s*dollars|\d+\s*billion|\d+\s*million|\d+\s*trillion)\b/gi,
    /\b(19\d\d|20\d\d)\b/g,
  ];

  let evidenceHits = 0;
  evidencePatterns.forEach((p) => {
    const matches = text.match(p);
    if (matches) evidenceHits += matches.length;
  });

  let evidence = 58 + Math.min(24, evidenceHits * 8) + (text.match(/\d+/g) ? 6 : 0);
  if (wordCount < 8) evidence = 40;
  evidence = Math.max(35, Math.min(94, Math.round(evidence)));

  // 3. Clarity & Rhetorical Articulation (Clarity)
  let clarity = 70;
  if (wordCount >= 15 && wordCount <= 85) clarity += 14;
  else if (wordCount >= 10 && wordCount <= 120) clarity += 8;
  else if (wordCount < 8) clarity -= 15;

  if (/[.!?]/.test(text)) clarity += 5;
  if (/,/.test(text)) clarity += 4;
  clarity = Math.max(45, Math.min(96, Math.round(clarity)));

  const overall = Math.round((logic + evidence + clarity) / 3);

  return {
    logic,
    evidence,
    clarity,
    overall,
    feedback: {
      logic: logicHits > 0
        ? 'Clear causal reasoning linking your premises to the conclusion.'
        : 'Good effort. Strengthen your case by connecting your claims with causal markers (e.g., "because", "therefore").',
      evidence: evidenceHits > 0
        ? 'Solid empirical grounding with relevant examples and data points.'
        : 'Incorporate real-world examples, studies, or quantitative benchmarks to make your claim undeniable.',
      clarity: clarity >= 75
        ? 'Strong articulation, persuasive rhythm, and concise sentence structure.'
        : 'Aim for structured sentences with clear pacing to maximize audience persuasion.',
    },
    sentiment: { compound: 0.2, pos: 0.6, neu: 0.4, neg: 0 },
  };
}

module.exports = {
  scoreArgument,
  aggregateScores,
  calculateTrend,
};
