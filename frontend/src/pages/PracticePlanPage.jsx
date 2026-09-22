import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import '../styles/theme.css';
import '../styles/dashboard.css';

const GOALS = [
  { id: 'reasoning', label: 'Improve Reasoning', icon: '🧠', desc: 'Strengthen logic, causal connections, and structural coherence' },
  { id: 'communication', label: 'Improve Communication', icon: '🗣️', desc: 'Refine verbal persuasion, tone adaptability, and conciseness' },
  { id: 'clarity', label: 'Improve Clarity', icon: '🎯', desc: 'Eliminate ambiguity, improve readability, and sharpen key arguments' },
  { id: 'evidence', label: 'Improve Evidence Usage', icon: '📊', desc: 'Incorporate statistics, concrete examples, and authoritative citations' },
  { id: 'fallacies', label: 'Reduce Logical Errors', icon: '🛡️', desc: 'Identify and prevent common fallacies like ad hominem and slippery slope' },
];

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', icon: '🌱', desc: 'Foundational concepts with guided coaching and step-by-step prompts' },
  { id: 'intermediate', label: 'Intermediate', icon: '⚡', desc: 'Moderate complexity with counter-argument drills and time limits' },
  { id: 'advanced', label: 'Advanced', icon: '🔥', desc: 'Rigorous critical challenges against adversarial practice coach models' },
];

const DURATIONS = [
  { id: 7, label: '7 Days', desc: 'Quick intensive habit booster' },
  { id: 14, label: '14 Days', desc: 'Comprehensive skill development' },
  { id: 30, label: '30 Days', desc: 'Complete communication mastery' },
];

const CURRICULUM_TEMPLATES = {
  reasoning: [
    { title: 'Premise-Conclusion Mapping', task: 'Distinguish primary claims from underlying assumptions in a tech debate.', topic: 'AI and automation will reshape the future of creative work' },
    { title: 'Causal Chain Construction', task: 'Build a multi-step causal argument without jumping to conclusions.', topic: 'Social media algorithms prioritize engagement over factual accuracy' },
    { title: 'Counter-Argument Anticipation', task: 'Identify 2 strongest objections before stating your primary position.', topic: 'Governments should regulate generative AI and deepfake technology strictly' },
    { title: 'Syllogistic Validation', task: 'Verify whether your conclusions logically follow from stated premises.', topic: 'Critical thinking instruction should be mandatory in primary education' },
    { title: 'Addressing Socratic Probing', task: 'Practice responding to deep questions exposing contradictions in arguments.', topic: 'Universal basic income can effectively cushion technological displacement' },
    { title: 'Synthesizing Competing Views', task: 'Formulate a nuanced compromise position supported by logical trade-offs.', topic: 'Remote work enhances productivity and life balance without compromising culture' },
    { title: 'Comprehensive Reasoning Review', task: 'Complete a full practice session aiming for 85%+ Logic Score.', topic: 'Standardized testing is an outdated metric for evaluating intellectual ability' },
  ],
  communication: [
    { title: 'Clear Value Proposition', task: 'Deliver a concise opening statement under 90 seconds.', topic: 'Smartphones have fundamentally changed deep interpersonal communication' },
    { title: 'Audience Engagement', task: 'Use rhetorical questions and conversational signposting.', topic: 'Critical thinking instruction should be mandatory in primary education' },
    { title: 'Tone Modulation', task: 'Practice calm, persuasive pacing in high-stakes discussions.', topic: 'Public surveillance in urban centers strikes a fair balance with civil liberties' },
    { title: 'Structured Rebuttals', task: 'Use Point-Evidence-Analysis structure for your responses.', topic: 'Open-source software promotes stronger security than closed proprietary models' },
    { title: 'Active Listening & Paraphrasing', task: 'Summarize the coach’s argument accurately before offering your response.', topic: 'Electoral systems should incorporate term limits for legislative representatives' },
    { title: 'Defending Nuanced Positions', task: 'Avoid defensive language when your ideas are challenged directly.', topic: 'Decentralized finance will significantly reduce global banking remittance fees' },
    { title: 'Live Fluency Assessment', task: 'Complete a voice or text session maintaining >80% clarity throughout.', topic: 'Online learning platforms can fully replace traditional university lectures' },
  ],
  clarity: [
    { title: 'Jargon Elimination', task: 'Explain a complex policy or technical issue in simple, plain terms.', topic: 'Cryptocurrency and decentralized finance regulations' },
    { title: 'Single Focus Paragraphs', task: 'Limit each turn to one clear core argument supported by detail.', topic: 'Nuclear energy is essential for achieving net-zero carbon emissions' },
    { title: 'Structural Signposting', task: 'Use first, secondly, and therefore to guide the listener.', topic: 'Individual consumer choices have negligible impact compared to industrial regulation' },
    { title: 'Concise Refutation', task: 'Refute a counter-claim in two sentences or fewer.', topic: 'Carbon taxation is the most economically efficient climate mitigation strategy' },
    { title: 'Sentence Rhythm & Readability', task: 'Alternate between short and medium sentences to maximize impact.', topic: 'Gig economy platforms exploit labor flexibility at the cost of social protections' },
    { title: 'Handling Complex Scenarios', task: 'Break down an intricate topic into three manageable components.', topic: 'Autonomous vehicles will make urban transportation safer and more efficient' },
    { title: 'Clarity Benchmark Drill', task: 'Complete a session aiming for maximum readability and zero ambiguity.', topic: 'Continuous skill re-learning is more valuable than a specialized college degree' },
  ],
  evidence: [
    { title: 'Data Citation Habits', task: 'Incorporate specific metrics and percentages to support claims.', topic: 'Renewable energy transition metrics and grid stability' },
    { title: 'Case Study Application', task: 'Anchor your argument with a real-world historical or industry example.', topic: 'Big tech antitrust and monopoly regulations' },
    { title: 'Evaluating Source Reliability', task: 'Distinguish anecdotal assertions from peer-reviewed findings.', topic: 'Standardized testing validity across diverse demographics' },
    { title: 'Statistical Integrity', task: 'Avoid correlation vs causation errors when citing metrics.', topic: 'Social media usage correlation with attention spans' },
    { title: 'Countering Weak Evidence', task: 'Identify and politely dismantle unsupported assertions from the coach.', topic: 'Universal basic income economic inflation projections' },
    { title: 'Empirical Synthesis', task: 'Combine two distinct research findings to support your thesis.', topic: 'Nuclear energy safety records compared to fossil fuel alternatives' },
    { title: 'Evidence Mastery Run', task: 'Achieve >85% Evidence Score in a formal structured practice session.', topic: 'Automation taxes and robotics adoption economics' },
  ],
  fallacies: [
    { title: 'Ad Hominem Defense', task: 'Focus strictly on the argument merits without attacking the speaker.', topic: 'Civic literacy tests should be introduced prior to casting election ballots' },
    { title: 'Slippery Slope Prevention', task: 'Ensure each sequential prediction in your chain has explicit evidentiary support.', topic: 'Governments should regulate generative AI and deepfake technology strictly' },
    { title: 'Dismantling False Dichotomies', task: 'Recognize third options and spectrum alternatives rather than either/or.', topic: 'Remote work vs mandatory in-office work policies' },
    { title: 'Avoiding Strawman Representations', task: 'State the opponent’s view in its strongest possible form before critique.', topic: 'Abolishing homework in secondary education institutions' },
    { title: 'Detecting Circular Reasoning', task: 'Ensure premises offer independent verification for conclusion claims.', topic: 'Freedom of speech boundaries in digital public squares' },
    { title: 'Red Herring Awareness', task: 'Stay precisely on topic without diverting to emotionally charged side issues.', topic: 'Public surveillance and urban crime deterrence' },
    { title: 'Zero Fallacy Challenge', task: 'Complete a multi-turn practice session with zero detected logical errors.', topic: 'AI and automation will reshape the future of creative work' },
  ],
};

export default function PracticePlanPage() {
  const { user } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const [selectedGoal, setSelectedGoal] = useState('reasoning');
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [activePlan, setActivePlan] = useState(null);
  const [completedDays, setCompletedDays] = useState({});

  // Load existing plan from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`thinkspace_plan_${user?._id || user?.id || 'guest'}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActivePlan(parsed.plan);
        setSelectedGoal(parsed.goal || 'reasoning');
        setSelectedDifficulty(parsed.difficulty || 'beginner');
        setSelectedDuration(parsed.duration || 7);
        setCompletedDays(parsed.completedDays || {});
      } catch (e) {
        // ignore
      }
    }
  }, [user]);

  const generatePlan = () => {
    const template = CURRICULUM_TEMPLATES[selectedGoal] || CURRICULUM_TEMPLATES.reasoning;
    const days = [];

    for (let i = 0; i < selectedDuration; i++) {
      const templateItem = template[i % template.length];
      const cycle = Math.floor(i / template.length) + 1;
      const dayNumber = i + 1;

      days.push({
        day: dayNumber,
        title: cycle > 1 ? `${templateItem.title} (Level ${cycle})` : templateItem.title,
        task: templateItem.task,
        topic: templateItem.topic,
        difficulty: selectedDifficulty,
        completed: false,
      });
    }

    const planData = {
      goal: selectedGoal,
      difficulty: selectedDifficulty,
      duration: selectedDuration,
      createdAt: new Date().toISOString(),
      days,
    };

    setActivePlan(planData);
    setCompletedDays({});

    localStorage.setItem(
      `thinkspace_plan_${user?._id || user?.id || 'guest'}`,
      JSON.stringify({
        goal: selectedGoal,
        difficulty: selectedDifficulty,
        duration: selectedDuration,
        plan: planData,
        completedDays: {},
      })
    );
  };

  const toggleDayCompletion = (dayNum) => {
    const updated = { ...completedDays, [dayNum]: !completedDays[dayNum] };
    setCompletedDays(updated);

    const saved = localStorage.getItem(`thinkspace_plan_${user?._id || user?.id || 'guest'}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.completedDays = updated;
        localStorage.setItem(`thinkspace_plan_${user?._id || user?.id || 'guest'}`, JSON.stringify(parsed));
      } catch (e) {
        // ignore
      }
    }
  };

  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const progressPercent = activePlan ? Math.round((completedCount / activePlan.days.length) * 100) : 0;

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', padding: '32px 20px 80px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* ── Top Navigation / Breadcrumbs ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <Link to="/dashboard" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 4px', color: 'var(--text-primary)' }}>
            Structured Practice Plan
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Follow a tailored curriculum to systematically elevate your communication and critical thinking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/lobby" className="ts-btn-primary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            ⚡ Go to Practice Arena
          </Link>
        </div>
      </div>

      {/* ── Plan Configuration Card ── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
          1. Choose Your Learning Focus
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {GOALS.map((g) => {
            const isSelected = selectedGoal === g.id;
            return (
              <div
                key={g.id}
                onClick={() => setSelectedGoal(g.id)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{g.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: 4 }}>
                  {g.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {g.desc}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Difficulty */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text-primary)' }}>
              2. Select Difficulty
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {DIFFICULTIES.map((d) => {
                const isSelected = selectedDifficulty === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(d.id)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: isSelected ? 'rgba(129, 140, 248, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1.5px solid var(--accent-secondary)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: isSelected ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                    }}
                  >
                    {d.icon} {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text-primary)' }}>
              3. Select Duration
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {DURATIONS.map((dur) => {
                const isSelected = selectedDuration === dur.id;
                return (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setSelectedDuration(dur.id)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: isSelected ? 'rgba(56, 189, 248, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                    }}
                  >
                    {dur.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={generatePlan}
          className="ts-btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
        >
          ✨ Generate Structured Practice Plan
        </button>
      </div>

      {/* ── Active Curriculum Roadmap ── */}
      {activePlan ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent-primary)', fontWeight: 700 }}>
                {activePlan.duration}-DAY ROADMAP
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-primary)' }}>
                {GOALS.find((g) => g.id === activePlan.goal)?.label || 'Practice Plan'}
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Level: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{activePlan.difficulty}</strong>
              </span>
            </div>

            {/* Progress indicator */}
            <div style={{ minWidth: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{completedCount} of {activePlan.days.length} Days ({progressPercent}%)</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-gradient)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activePlan.days.map((d) => {
              const isDone = !!completedDays[d.day];
              return (
                <div
                  key={d.day}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: isDone ? '1px solid var(--border-user)' : '1px solid var(--border)',
                    transition: 'var(--transition)',
                  }}
                >
                  {/* Completion toggle */}
                  <button
                    type="button"
                    onClick={() => toggleDayCompletion(d.day)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: isDone ? '2px solid var(--accent-user)' : '2px solid var(--border)',
                      background: isDone ? 'var(--accent-user)' : 'transparent',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                    title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isDone ? '✓' : ''}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isDone ? 'var(--accent-user)' : 'var(--accent-primary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 12 }}>
                        Day {d.day}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.8 : 1 }}>
                        {d.title}
                      </h4>
                    </div>

                    <p style={{ margin: '0 0 6px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {d.task}
                    </p>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Recommended Topic: <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{d.topic}"</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/lobby')}
                    style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: 'var(--accent-primary)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Practice Now →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="ts-empty-state">
          <span className="ts-empty-icon">📅</span>
          <div className="ts-empty-title">No Practice Plan Configured</div>
          <p className="ts-empty-desc">
            Select a learning focus, target difficulty, and duration above to build your personalized ThinkSpace roadmap.
          </p>
        </div>
      )}
    </div>
  );
}
