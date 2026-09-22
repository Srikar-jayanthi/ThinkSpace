import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';
import '../styles/theme.css';

const CAPABILITIES = [
  { icon: '🎯', title: 'Interactive Practice Arena', desc: 'Engage in structured verbal and textual practice sessions against an adaptive Practice Coach.' },
  { icon: '⚡', title: 'Real-Time Response Analysis', desc: 'Immediate evaluation of logic structure, causal consistency, clarity, and factual evidence markers.' },
  { icon: '🛡️', title: 'Logical Error Radar', desc: 'Identify and eliminate common reasoning errors like slippery slopes, ad hominems, and false dilemmas.' },
  { icon: '📈', title: 'Performance Center', desc: 'Track progress trends, multi-dimensional competency radar charts, and historical improvement milestones.' },
  { icon: '📅', title: 'Personalized Practice Plans', desc: 'Follow 7, 14, or 30-day curated curricula targeting your specific communication and reasoning goals.' },
  { icon: '🌐', title: 'Multi-Perspective Scenarios', desc: 'Explore diverse scenarios across technology, societal ethics, economics, education, and public policy.' },
];

const WORKFLOW_STEPS = [
  { step: '01', title: 'Practice', desc: 'Select a discussion topic or custom scenario and present your ideas against the Practice Coach.' },
  { step: '02', title: 'Analysis', desc: 'The NLP engine assesses argument coherence, evidence density, readability, and logical fallacies.' },
  { step: '03', title: 'Feedback', desc: 'Receive instant turn-by-turn scores, constructive counter-perspectives, and a comprehensive Performance Report.' },
  { step: '04', title: 'Improvement', desc: 'Follow your personalized Practice Plan to turn identified weaknesses into communication strengths.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '#38bdf8' : '#818cf8',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    const els = pageRef.current?.querySelectorAll('.landing-reveal');
    if (!els?.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ── Mouse parallax on hero orb ── */
  useEffect(() => {
    const handler = (e) => setMousePos({
      x: e.clientX / window.innerWidth - 0.5,
      y: e.clientY / window.innerHeight - 0.5,
    });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div className="lp-page" ref={pageRef}>
      <canvas ref={canvasRef} className="lp-canvas" />

      {/* ── Top Navigation ── */}
      <header className="lp-nav">
        <div className="lp-nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="lp-nav-logo-icon" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }}>💡</span>
          <span className="lp-nav-logo-text" style={{ letterSpacing: -0.5 }}>ThinkSpace</span>
        </div>
        <div className={`lp-nav-links ${menuOpen ? 'lp-nav-links--open' : ''}`}>
          <a href="#how" className="lp-nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#capabilities" className="lp-nav-link" onClick={() => setMenuOpen(false)}>Key Capabilities</a>
          <div className="lp-nav-mobile-only">
            <button className="lp-nav-signin" onClick={() => { navigate('/login'); setMenuOpen(false); }}>Sign In</button>
            <button className="lp-nav-cta" onClick={() => { navigate('/register'); setMenuOpen(false); }}>Start Practice</button>
          </div>
        </div>
        <div className="lp-nav-actions">
          <button className="lp-nav-signin" onClick={() => navigate('/login')}>Sign In</button>
          <button className="lp-nav-cta" onClick={() => navigate('/register')}>Start Practice</button>
          <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Navigation">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="lp-hero" id="top">
        <div className="lp-hero-content">
          <div className="lp-hero-badge landing-reveal">
            <span className="lp-hero-badge-dot" />
            <span className="lp-hero-badge-text">Interactive Communication &amp; Critical Thinking</span>
          </div>

          <h1 className="lp-hero-title landing-reveal">
            Sharpen Your Mind.
            <br />
            <span className="lp-hero-accent" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Communicate with Impact.
            </span>
          </h1>

          <p className="lp-hero-sub landing-reveal">
            ThinkSpace helps students and professionals master structured communication and critical reasoning.
            Engage with an intelligent Practice Coach, identify reasoning blind spots, and track your growth with actionable performance insights.
          </p>

          <div className="lp-hero-actions landing-reveal">
            <button className="lp-btn-primary" onClick={() => navigate('/register')} style={{ background: 'var(--accent-gradient)', border: 'none' }}>
              <span>Start Free Practice</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="lp-btn-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>

          <div className="lp-hero-trust landing-reveal">
            <span className="lp-trust-dot" />
            <span>Interactive Arenas</span>
            <span className="lp-trust-sep">·</span>
            <span className="lp-trust-dot" />
            <span>Real-Time Feedback</span>
            <span className="lp-trust-sep">·</span>
            <span className="lp-trust-dot" />
            <span>Structured Practice Plans</span>
          </div>
        </div>

        {/* Visual Orb */}
        <div
          className="lp-hero-visual landing-reveal"
          style={{ transform: `translate(${mousePos.x * 16}px, ${mousePos.y * 12}px)` }}
        >
          <div className="lp-orb-wrap">
            <div className="lp-orb-ring lp-orb-ring--1" />
            <div className="lp-orb-ring lp-orb-ring--2" />
            <div className="lp-orb-ring lp-orb-ring--3" />
            <div className="lp-orb-core" style={{ background: 'var(--accent-primary)', boxShadow: '0 0 30px #38bdf8' }}>
              <span className="lp-orb-icon">💡</span>
            </div>
            {/* Stat chips */}
            <div className="lp-chip lp-chip--1">🧠 Reasoning: 88%</div>
            <div className="lp-chip lp-chip--2">🛡️ Fallacy Caught</div>
            <div className="lp-chip lp-chip--3">📊 Evidence: 84%</div>
            <div className="lp-chip lp-chip--4">🎯 Clarity: 92%</div>
          </div>
        </div>
      </section>

      {/* ══════════ WORKFLOW SECTION ══════════ */}
      <section className="lp-how" id="how" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="lp-section-header landing-reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="lp-section-tag" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>
            Structured Learning Methodology
          </div>
          <h2 className="lp-section-title" style={{ fontSize: '2.2rem', fontWeight: 800, margin: '10px 0', color: 'var(--text-primary)' }}>
            Practice → Analysis → Feedback → Improvement
          </h2>
          <p className="lp-section-sub" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            A proven continuous cycle designed to transform intuitive thinking into disciplined, persuasive reasoning.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {WORKFLOW_STEPS.map((ws, i) => (
            <div
              key={i}
              className="landing-reveal"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '24px',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-primary)', opacity: 0.8, marginBottom: 12 }}>
                {ws.step}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                {ws.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {ws.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CAPABILITIES SECTION ══════════ */}
      <section className="lp-features" id="capabilities" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="lp-section-header landing-reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="lp-section-tag" style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>
            Platform Features
          </div>
          <h2 className="lp-section-title" style={{ fontSize: '2.2rem', fontWeight: 800, margin: '10px 0', color: 'var(--text-primary)' }}>
            Engineered for Clear Communication
          </h2>
          <p className="lp-section-sub" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Comprehensive tools built to sharpen arguments, enhance structure, and eliminate logical pitfalls.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {CAPABILITIES.map((c, i) => (
            <div
              key={i}
              className="landing-reveal"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '24px',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 14 }}>{c.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                {c.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CALL TO ACTION ══════════ */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.08) 0%, transparent 70%)' }}>
        <div className="landing-reveal" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
            Ready to Elevate Your Critical Thinking?
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
            Join ThinkSpace today. Test your reasoning, challenge your perspectives, and become an articulate communicator.
          </p>
          <button
            className="ts-btn-primary"
            onClick={() => navigate('/register')}
            style={{ padding: '14px 32px', fontSize: '1.05rem' }}
          >
            Create Your Free Account →
          </button>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>ThinkSpace</span>
          <span>·</span>
          <span>Interactive Communication &amp; Critical Thinking</span>
        </div>
        <p style={{ margin: 0 }}>
          Designed and developed as an advanced pair-programmed engineering project.
        </p>
      </footer>
    </div>
  );
}
