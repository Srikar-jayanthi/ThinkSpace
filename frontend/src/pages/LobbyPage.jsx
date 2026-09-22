import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import '../styles/lobby.css';
import '../styles/lobby-format.css';

const CATEGORIES = [
  'All',
  'Technology',
  'Society',
  'Politics',
  'Education',
  'Environment',
  'Economy',
];

const DIFFICULTIES = [
  {
    key: 'beginner',
    icon: '🌱',
    name: 'Beginner',
    desc: 'Guided practice with helpful coaching prompts',
  },
  {
    key: 'intermediate',
    icon: '⚡',
    name: 'Intermediate',
    desc: 'Balanced reasoning challenge with fewer prompts',
  },
  {
    key: 'expert',
    icon: '🔥',
    name: 'Expert',
    desc: 'Rigorous critical challenge against sharp counter-arguments',
  },
  {
    key: 'devil',
    icon: '🧐',
    name: "Devil's Advocate",
    desc: 'Coach questions your underlying premises',
  },
];

const PERSONAS = [
  { key: 'balanced',   icon: '⚖️', name: 'Balanced',   desc: 'Constructive and fair — ideal baseline coach' },
  { key: 'socratic',   icon: '🧐', name: 'Socratic',   desc: 'Probing inquiries that expose unstated assumptions' },
  { key: 'aggressive', icon: '⚡', name: 'Challenging', desc: 'Direct, fast-paced refutations and sharp tests' },
  { key: 'academic',   icon: '🎓', name: 'Academic',   desc: 'Rigorous citations, logic notation, and formal tone' },
  { key: 'casual',     icon: '☕', name: 'Collaborative', desc: 'Thoughtful colleague exploring real-world trade-offs' },
];

const FORMATS = [
  { key: 'freeform',          icon: '💬', name: 'Freeform Discussion', desc: 'Open conversation without strict round limits',  badge: 'RECOMMENDED', badgeColor: '#38bdf8' },
  { key: 'oxford',            icon: '🎓', name: 'Structured Oxford',   desc: 'Opening → Rebuttal → Cross-Exam → Closing',    badge: 'INTERMEDIATE', badgeColor: '#818cf8' },
  { key: 'lincoln_douglas',   icon: '⚖️',  name: 'Values & Ethics',     desc: 'Deep examination of principles and ethics',    badge: 'ADVANCED',    badgeColor: '#f59e0b' },
  { key: 'parliamentary',     icon: '🏛️', name: 'Policy Examination',  desc: 'Practical implementation and societal impact', badge: 'EXPERT',      badgeColor: '#ec4899' },
];

const DIFF_COLORS = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const MAX_CUSTOM_TOPIC_LEN = 150;

export default function LobbyPage() {
  const { user } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  // "browse" | "custom"
  const [mode, setMode] = useState('browse');

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [customTopicText, setCustomTopicText] = useState('');

  const [side, setSide] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [persona, setPersona] = useState('balanced');
  const [format, setFormat] = useState('freeform');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const sideRef = useRef(null);
  const diffRef = useRef(null);
  const personaRef = useRef(null);
  const formatRef = useRef(null);
  const customInputRef = useRef(null);
  const apiRef = useRef(api);
  apiRef.current = api;

  /* ── Fetch topics on mount ── */
  useEffect(() => {
    let mounted = true;
    apiRef.current
      .get('/api/topics')
      .then((res) => { if (mounted) setTopics(res.data.topics ?? res.data); })
      .catch(() => { if (mounted) setError('Failed to load discussion topics.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  /* ── Reset step-2 / step-3 when mode or topic changes ── */
  const resetSteps = () => {
    setSide(null);
    setDifficulty(null);
    setPersona('balanced');
    setFormat('freeform');
  };

  const switchMode = (m) => {
    setMode(m);
    setSelectedTopic(null);
    setCustomTopicText('');
    resetSteps();
  };

  /* ── Filters ── */
  const filtered =
    activeTab === 'All'
      ? topics
      : topics.filter(
          (t) => t.category?.toLowerCase() === activeTab.toLowerCase()
        );

  /* ── Random pick ── */
  const pickRandom = () => {
    if (filtered.length === 0) return;
    const rand = filtered[Math.floor(Math.random() * filtered.length)];
    setSelectedTopic(rand);
    resetSteps();
    setTimeout(
      () => sideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      50
    );
  };

  /* ── Scroll helpers ── */
  const scrollToSide = () =>
    setTimeout(
      () => sideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      50
    );
  const scrollToDiff = () =>
    setTimeout(
      () => diffRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      50
    );
  const scrollToPersona = () =>
    setTimeout(
      () => personaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      50
    );
  const scrollToFormat = () =>
    setTimeout(
      () => formatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      50
    );

  /* ── Derived values ── */
  const activeTopic =
    mode === 'custom' ? customTopicText.trim() : selectedTopic?.title ?? null;
  const canStart = activeTopic && activeTopic.length >= 5 && side && difficulty;

  /* ── Start practice session ── */
  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    setError('');
    try {
      const body =
        mode === 'custom'
          ? { customTopic: customTopicText.trim(), side, difficulty, persona, format }
          : {
              topicId: selectedTopic._id ?? selectedTopic.id,
              side,
              difficulty,
              persona,
              format,
            };

      const res = await api.post('/api/debates/start', body);
      navigate(`/debate/${res.data.debateId ?? res.data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Could not start practice session.'
      );
    } finally {
      setStarting(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="lobby">
      {/* ── Breadcrumb Navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: '0.88rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--accent-primary, #38bdf8)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          ← Back to Dashboard
        </Link>
        <span style={{ color: 'var(--text-muted, #64748b)' }}>/</span>
        <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>Practice Scenario Setup</span>
      </div>

      {/* ── Header ── */}
      <header className="lobby-header">
        <div>
          <h1 className="lobby-heading">Choose Your Practice Scenario</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '4px 0 0' }}>
            Select a discussion topic and configure your practice coach parameters.
          </p>
        </div>
        <div className="lobby-user" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="lobby-elo">{user?.eloRating ?? 1000}</span>
            <span className="lobby-username">{user?.username ?? 'Thinker'}</span>
          </Link>
        </div>
      </header>

      {/* ── Mode toggle ── */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'browse' ? 'mode-btn--active' : ''}`}
          onClick={() => switchMode('browse')}
        >
          📋 Discussion Topics
        </button>
        <button
          className={`mode-btn ${mode === 'custom' ? 'mode-btn--active' : ''}`}
          onClick={() => {
            switchMode('custom');
            setTimeout(() => customInputRef.current?.focus(), 80);
          }}
        >
          ✍️ Custom Scenario
        </button>
      </div>

      {/* ── Browse mode ── */}
      {mode === 'browse' && (
        <>
          {/* ── Category tabs ── */}
          <nav className="lobby-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`lobby-tab ${activeTab === cat ? 'lobby-tab--active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* ── Random button ── */}
          <button className="lobby-random" onClick={pickRandom}>
            🎲 Random Topic
          </button>

          {/* ── Topics grid ── */}
          <div className="lobby-grid">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="topic-skeleton" style={{ animationDelay: `${i * 100}ms` }} />
              ))
            ) : filtered.length === 0 ? (
              <div className="no-topics">No topics found for this category.</div>
            ) : (
              filtered.map((topic) => {
                const id = topic._id ?? topic.id;
                const selected =
                  selectedTopic && (selectedTopic._id ?? selectedTopic.id) === id;
                return (
                  <button
                    key={id}
                    className={`topic-card ${selected ? 'topic-card--selected' : ''}`}
                    onClick={() => {
                      setSelectedTopic(topic);
                      resetSteps();
                      scrollToSide();
                    }}
                  >
                    <span className="topic-title">{topic.title}</span>
                    <div className="topic-meta">
                      <span
                        className="topic-pill"
                        data-category={topic.category?.toLowerCase()}
                      >
                        {topic.category}
                      </span>
                      <span
                        className="topic-diff"
                        style={{ color: DIFF_COLORS[topic.difficulty?.toLowerCase()] }}
                      >
                        {topic.difficulty}
                      </span>
                    </div>
                    <span className="topic-count">
                      {topic.debateCount ?? 0} sessions
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ── Custom topic mode ── */}
      {mode === 'custom' && (
        <div className="custom-topic-area">
          <label className="custom-topic-label" htmlFor="custom-topic-input">
            Enter any topic or question — your Practice Coach will test your arguments.
          </label>
          <textarea
            id="custom-topic-input"
            ref={customInputRef}
            className="custom-topic-input"
            placeholder="e.g. 'Universal Basic Income will reduce poverty without causing inflation' or 'Artificial intelligence in healthcare requires federal oversight'"
            value={customTopicText}
            maxLength={MAX_CUSTOM_TOPIC_LEN}
            rows={3}
            onChange={(e) => {
              setCustomTopicText(e.target.value);
              resetSteps();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (customTopicText.trim().length >= 5) scrollToSide();
              }
            }}
          />
          <div className="custom-topic-meta">
            <span
              className={`custom-topic-hint ${
                customTopicText.trim().length > 0 && customTopicText.trim().length < 5
                  ? 'custom-topic-hint--warn'
                  : ''
              }`}
            >
              {customTopicText.trim().length < 5 && customTopicText.length > 0
                ? 'Keep going…'
                : customTopicText.trim().length >= 5
                ? '✓ Topic ready'
                : 'Minimum 5 characters'}
            </span>
            <span className="custom-topic-counter">
              {customTopicText.length} / {MAX_CUSTOM_TOPIC_LEN}
            </span>
          </div>
          {customTopicText.trim().length >= 5 && (
            <button
              className="custom-topic-proceed"
              onClick={scrollToSide}
            >
              Continue → Select Your Stance
            </button>
          )}
        </div>
      )}

      {/* ── Stance selector ── */}
      <div
        ref={sideRef}
        className={`lobby-section ${
          (mode === 'browse' && selectedTopic) ||
          (mode === 'custom' && customTopicText.trim().length >= 5)
            ? 'lobby-section--open'
            : ''
        }`}
      >
        <h2 className="lobby-section-title">Select Your Stance</h2>
        <div className="side-row">
          <button
            className={`side-btn side-btn--for ${side === 'for' ? 'side-btn--active' : ''}`}
            onClick={() => {
              setSide('for');
              scrollToDiff();
            }}
          >
            👍 SUPPORT / FOR
          </button>
          <button
            className={`side-btn side-btn--against ${side === 'against' ? 'side-btn--active' : ''}`}
            onClick={() => {
              setSide('against');
              scrollToDiff();
            }}
          >
            👎 OPPOSE / AGAINST
          </button>
        </div>
      </div>

      {/* ── Difficulty selector ── */}
      <div
        ref={diffRef}
        className={`lobby-section ${side ? 'lobby-section--open' : ''}`}
      >
        <h2 className="lobby-section-title">Select Challenge Level</h2>
        <div className="diff-row">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              className={`diff-card ${difficulty === d.key ? 'diff-card--active' : ''} ${d.key === 'devil' ? 'diff-card--devil' : ''}`}
              onClick={() => {
                setDifficulty(d.key);
                scrollToPersona();
              }}
            >
              <span className="diff-icon">{d.icon}</span>
              <span className="diff-name">{d.name}</span>
              <span className="diff-desc">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Coach Style selector ── */}
      <div
        ref={personaRef}
        className={`lobby-section ${difficulty ? 'lobby-section--open' : ''}`}
      >
        <h2 className="lobby-section-title">Select Practice Coach Style</h2>
        <div className="persona-row">
          {PERSONAS.map((p) => (
            <button
              key={p.key}
              className={`persona-card ${persona === p.key ? 'persona-card--active' : ''}`}
              onClick={() => { setPersona(p.key); scrollToFormat(); }}
            >
              <span className="persona-icon">{p.icon}</span>
              <span className="persona-name">{p.name}</span>
              <span className="persona-desc">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Format selector ── */}
      <div
        ref={formatRef}
        className={`lobby-section ${persona ? 'lobby-section--open' : ''}`}
      >
        <h2 className="lobby-section-title">Choose Practice Format</h2>
        <div className="format-row">
          {FORMATS.map((f) => (
            <button
              key={f.key}
              className={`format-card ${format === f.key ? 'format-card--active' : ''}`}
              onClick={() => setFormat(f.key)}
            >
              <span className="format-badge" style={{ background: f.badgeColor }}>{f.badge}</span>
              <span className="format-icon">{f.icon}</span>
              <span className="format-name">{f.name}</span>
              <span className="format-desc">{f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ── */}
      {error && <p className="lobby-error">{error}</p>}

      {/* ── Start button ── */}
      <button
        className={`lobby-start ${canStart ? 'lobby-start--ready' : ''}`}
        disabled={!canStart || starting}
        onClick={handleStart}
      >
        {starting ? 'Initializing Practice Arena…' : '⚡ Enter Practice Arena'}
      </button>
    </div>
  );
}
