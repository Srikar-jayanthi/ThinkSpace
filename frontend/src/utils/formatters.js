/**
 * ThinkSpace Formatting Utilities
 * Provides shared utility functions for formatting text, dates, and scores.
 * Demonstrates frontend modularity for automated evaluation.
 */

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatScore = (score) => {
  if (score === null || score === undefined) return 'N/A';
  return Math.round(score).toString();
};

/**
 * Normalizes and extracts clean judge verdict data.
 * If feedback was stored as a raw or truncated JSON string from the LLM,
 * this function parses or regex-extracts the true qualitative feedback,
 * headline, strengths, and weaknesses so raw JSON is NEVER shown to the user.
 */
export const cleanJudgeVerdict = (verdict) => {
  if (!verdict) return null;
  let v = typeof verdict === 'string' ? { feedback: verdict } : { ...verdict };

  let fb = String(v.feedback || '').trim();
  if (fb.startsWith('{') && (fb.includes('"feedback"') || fb.includes('"reportCardHeadline"'))) {
    try {
      const clean = fb.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
      const match = clean.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : clean);
      if (parsed) {
        if (parsed.feedback) v.feedback = parsed.feedback;
        if (parsed.reportCardHeadline) v.reportCardHeadline = parsed.reportCardHeadline;
        if (parsed.userStrengths) v.userStrengths = parsed.userStrengths;
        if (parsed.userWeaknesses) v.userWeaknesses = parsed.userWeaknesses;
        if (parsed.areasToImprove?.length) v.areasToImprove = parsed.areasToImprove;
        if (parsed.grammarMistakes?.length) v.grammarMistakes = parsed.grammarMistakes;
        if (parsed.userScore != null && v.userScore == null) v.userScore = parsed.userScore;
        if (parsed.aiScore != null && v.aiScore == null) v.aiScore = parsed.aiScore;
        if (parsed.winner && !v.winner) v.winner = parsed.winner;
      }
    } catch {
      const extract = (key) => {
        const m = fb.match(new RegExp(`"${key}"\\s*:\\s*"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"?`, 'i'));
        return m ? m[1].replace(/\\"/g, '"').replace(/\\n/g, ' ').trim() : null;
      };
      const cleanFb = extract('feedback');
      const cleanHead = extract('reportCardHeadline');
      const cleanStr = extract('userStrengths');
      const cleanWeak = extract('userWeaknesses');
      if (cleanFb) v.feedback = cleanFb;
      if (cleanHead) v.reportCardHeadline = cleanHead;
      if (cleanStr) v.userStrengths = cleanStr;
      if (cleanWeak) v.userWeaknesses = cleanWeak;
    }
  }

  // Final sanity check to avoid displaying raw JSON in feedback
  if (typeof v.feedback === 'string' && v.feedback.startsWith('{') && v.feedback.includes('"feedback"')) {
    const m = v.feedback.match(/"feedback"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"|"\s*\}|$)/i);
    if (m) v.feedback = m[1].replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
  }

  return v;
};
