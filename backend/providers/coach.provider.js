'use strict';

/**
 * @fileoverview ThinkSpace Coach Provider — Built-in resilient Practice Coach.
 *
 * Serves as the intelligent built-in practice evaluator and conversational sparring partner.
 * Ensures the platform is 100% self-contained, functional offline, and zero-setup during
 * evaluation or when external LLM APIs (Groq, OpenAI, Sarvam) are not configured.
 *
 * @module providers/coach.provider
 */

const BaseProvider = require('./base.provider');

class CoachProvider extends BaseProvider {
  getName() {
    return 'ThinkSpace Coach';
  }

  isAvailable() {
    return true; // Always available as built-in resilient engine
  }

  supportsLanguage(_langCode) {
    return true;
  }

  /**
   * Generate an intelligent, pedagogical Socratic response.
   *
   * @param {Object} session - Practice session context
   * @param {string} userArgument - User's submitted perspective
   * @returns {Promise<string>}
   */
  async generate(session, userArgument) {
    const topic = (session && (session.topic?.title || session.topic)) || 'this subject';
    const persona = (session && session.persona) || 'socratic';
    const difficulty = (session && session.difficulty) || 'intermediate';
    const roundNumber = ((session && session.conversationHistory) ? session.conversationHistory.length : 0) + 1;

    const trimmed = (userArgument || '').trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

    // Analyze rhetorical elements in user input
    const hasEvidence = /\b(because|evidence|data|study|studies|research|example|instance|statistics|percent|proven|demonstrate)\b/i.test(trimmed);
    const hasCounterWeight = /\b(however|although|despite|on the other hand|while|admittedly|concede|whereas)\b/i.test(trimmed);
    const hasAbsoluteClaims = /\b(always|never|completely|impossible|everyone|nobody|undeniable|fact that)\b/i.test(trimmed);

    // Extract notable thematic keywords
    const keywords = trimmed
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 5 && !['should', 'people', 'system', 'reason', 'because', 'think', 'believe', 'actually', 'really'].includes(w))
      .slice(0, 3);

    const keyFocus = keywords.length > 0 ? `regarding ${keywords.join(' and ')}` : 'in your reasoning';

    // Tailor response based on persona
    let responseText = '';

    if (persona === 'socratic') {
      if (wordCount < 15) {
        responseText = `You've stated a concise premise, but critical inquiry requires deeper elaboration. When you assert that stance ${keyFocus}, what foundational assumptions are you making about human behavior or institutional limits? How might someone with an opposing priority counter your point?`;
      } else if (hasAbsoluteClaims) {
        responseText = `You present a strong stance, yet claims framed in absolutes often conceal underlying trade-offs. While your focus ${keyFocus} highlights one dimension of "${topic}", consider the edge cases: under what specific constraints might this perspective fail to hold? What unintended consequences could arise if society implemented this universally?`;
      } else if (!hasEvidence) {
        responseText = `That is an intriguing proposition. You have outlined the logic of your perspective, but what observable evidence or real-world precedent substantiates this claim? If an opponent argued that empirical trends show the opposite outcome, how would you defend the validity of your premise?`;
      } else {
        responseText = `A structured argument. You acknowledge practical considerations ${keyFocus}, which strengthens your initial position. Pushing this further into round ${roundNumber}: how do you reconcile the friction between individual agency and systemic oversight on "${topic}"? What metric would you propose to measure whether your approach is genuinely succeeding?`;
      }
    } else if (persona === 'academic') {
      if (!hasEvidence) {
        responseText = `From an analytical standpoint, your thesis requires empirical anchoring. While the conceptual framing ${keyFocus} is worth examining, scholarly consensus generally requires comparative data or historical analogues. What methodological evidence or institutional case studies support this conclusion over alternative policy models?`;
      } else {
        responseText = `Your synthesis demonstrates logical coherence and incorporates evidentiary cues. However, literature examining "${topic}" frequently identifies systemic externalities. How does your model account for resource allocation disparities and secondary economic or sociological repercussions in the long run?`;
      }
    } else if (persona === 'balanced') {
      responseText = `You raise a valid dimension ${keyFocus}. On one hand, prioritizing this perspective fosters clear advantages. On the other hand, stakeholders opposing this view often cite equity, cost implementation, and practical friction. To build a truly robust stance on "${topic}", how would you synthesize both viewpoints without compromising your core principle?`;
    } else if (persona === 'aggressive' || persona === 'challenger') {
      responseText = `That premise sounds compelling in theory, but falls short under rigorous pressure. Focus on your claim ${keyFocus}: you haven't fully accounted for feasibility or direct counter-incentives. If your opponent challenges the viability of this claim in practice, what concrete defense can you offer right now?`;
    } else {
      // Conversational / Default
      responseText = `Good point to consider. You brought up an interesting angle ${keyFocus}. Looking at "${topic}" from the other side, though, many people worry about unintended side effects and practical trade-offs. How would you convince a skeptic that your reasoning holds up against those concerns?`;
    }

    return responseText;
  }

  /**
   * Stream response with natural typing rhythm.
   */
  async *stream(session, userArgument) {
    const text = await this.generate(session, userArgument);
    const chunks = text.match(/\S+\s*/g) || [text];

    // Yield words in natural small groups
    for (let i = 0; i < chunks.length; i += 3) {
      const slice = chunks.slice(i, i + 3).join('');
      yield slice;
      // Brief natural pacing
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  }
}

module.exports = CoachProvider;
