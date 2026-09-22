import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AppFooter.css';

export default function AppFooter() {
  const location = useLocation();
  const pathname = location.pathname;

  // Do not show the footer in full-screen debate sessions or on the landing page (which has its own footer)
  if (pathname.startsWith('/debate/') || pathname === '/') {
    return null;
  }

  return (
    <footer className="app-footer" aria-label="ThinkSpace Footer">
      <div className="app-footer-container">
        {/* Brand & Mission */}
        <div className="app-footer-col app-footer-col--brand">
          <div className="app-footer-brand">
            <span className="app-footer-logo">💡</span>
            <span className="app-footer-title">ThinkSpace</span>
          </div>
          <p className="app-footer-desc">
            An Interactive Communication and Critical Thinking Platform designed to elevate
            argumentation, structured critical reasoning, and evidence-based speaking skills.
          </p>
          <div className="app-footer-status">
            <span className="status-dot-pulse" />
            <span>AI Practice Engine Operational</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="app-footer-col">
          <h4 className="app-footer-heading">Platform Navigation</h4>
          <ul className="app-footer-links">
            <li><Link to="/dashboard">📊 Dashboard Home</Link></li>
            <li><Link to="/lobby">⚡ Practice Arena</Link></li>
            <li><Link to="/performance">📈 Performance Analytics</Link></li>
            <li><Link to="/plan">📅 Adaptive Practice Plan</Link></li>
            <li><Link to="/history">📜 Session History & Reports</Link></li>
            <li><Link to="/leaderboard">🏆 Community Rankings</Link></li>
          </ul>
        </div>

        {/* Evaluation Pillars (Beginner Friendly) */}
        <div className="app-footer-col">
          <h4 className="app-footer-heading">How ThinkSpace Evaluates You</h4>
          <ul className="app-footer-pillars">
            <li>
              <strong>🧠 Reasoning (Logic)</strong>
              <span>Measures causal coherence, premise structure, and avoidance of fallacies.</span>
            </li>
            <li>
              <strong>📊 Concrete Evidence</strong>
              <span>Detects statistics, peer-reviewed studies, and verifiable real-world facts.</span>
            </li>
            <li>
              <strong>🗣️ Clarity & Articulation</strong>
              <span>Assesses readability, sentence flow, vocabulary, and persuasive delivery.</span>
            </li>
          </ul>
        </div>

        {/* Academic Project Attribution */}
        <div className="app-footer-col">
          <h4 className="app-footer-heading">College Internship Project</h4>
          <p className="app-footer-tech">
            Engineered with a real-time full-stack architecture: React + Web Speech API, Node.js + Socket.IO,
            FastAPI NLP Microservice (SpaCy + NLTK VADER), and an AI Multi-Provider Cascading Orchestrator.
          </p>
          <div className="app-footer-badge">
            Academic Year 2026 • College Final Project
          </div>
        </div>
      </div>

      <div className="app-footer-bottom">
        <div className="app-footer-bottom-inner">
          <span>© 2026 ThinkSpace — Interactive Communication and Critical Thinking Platform.</span>
          <span className="app-footer-sub">Designed for Academic & Professional Communication Excellence.</span>
        </div>
      </div>
    </footer>
  );
}
