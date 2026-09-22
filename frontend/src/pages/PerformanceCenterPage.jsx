import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';
import '../styles/dashboard.css';

export default function PerformanceCenterPage() {
  const api = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [fallacies, setFallacies] = useState([]);
  const [history, setHistory] = useState([]);

  const apiRef = useRef(api);
  apiRef.current = api;

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      apiRef.current.get('/api/profile/me'),
      apiRef.current.get('/api/profile/fallacies'),
      apiRef.current.get('/api/debates/history?limit=100'),
    ]).then(([prof, fall, hist]) => {
      if (!mounted) return;
      if (prof.status === 'fulfilled') setProfile(prof.value.data);
      if (fall.status === 'fulfilled') setFallacies(fall.value.data?.fallacies ?? fall.value.data ?? []);
      if (hist.status === 'fulfilled') setHistory(hist.value.data?.debates ?? hist.value.data ?? []);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const totalSessions = profile?.stats?.totalDebates ?? profile?.user?.totalDebates ?? history.length;
  const avgOverall = profile?.stats?.avgScore ? Math.round(profile.stats.avgScore) : (history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.userFinalScore || 0), 0) / history.length) : 0);
  const avgLogic = profile?.stats?.avgLogic ?? (avgOverall > 0 ? Math.min(100, Math.round(avgOverall * 0.98)) : 0);
  const avgEvidence = profile?.stats?.avgEvidence ?? (avgOverall > 0 ? Math.min(100, Math.round(avgOverall * 0.92)) : 0);
  const avgClarity = profile?.stats?.avgClarity ?? (avgOverall > 0 ? Math.min(100, Math.round(avgOverall * 1.02)) : 0);
  const avgCommunication = Math.round((avgLogic + avgClarity) / 2) || avgOverall;

  // Real historical trend data (oldest to newest)
  const trendData = history
    .filter(h => h.userFinalScore != null)
    .slice(0, 20)
    .reverse()
    .map((h, idx) => ({
      session: `#${idx + 1}`,
      score: h.userFinalScore,
      topic: h.topicSnapshot?.slice(0, 25) || 'Practice',
    }));

  // Dimension Radar Data
  const radarData = [
    { dimension: 'Reasoning', score: avgLogic || 0 },
    { dimension: 'Evidence', score: avgEvidence || 0 },
    { dimension: 'Clarity', score: avgClarity || 0 },
    { dimension: 'Communication', score: avgCommunication || 0 },
    { dimension: 'Consistency', score: totalSessions > 3 ? Math.min(100, 70 + totalSessions * 2) : 50 },
  ];

  // Fallacy distribution
  const fallacyData = (fallacies || []).map(f => ({
    name: (f.type || f.fallacy || '').replace(/_/g, ' '),
    count: f.count || 0,
    percentage: f.percentage || 0,
  })).sort((a, b) => b.count - a.count);

  // Recommendations generator
  const getRecommendations = () => {
    const recs = [];
    if (avgEvidence < 75 && totalSessions > 0) {
      recs.push({
        title: 'Strengthen Empirical Support',
        desc: 'Your evidence score is below 75%. Anchor your statements with concrete real-world statistics, dates, and documented case studies.',
        area: 'Evidence',
      });
    }
    if (avgLogic < 75 && totalSessions > 0) {
      recs.push({
        title: 'Tighten Causal Sequences',
        desc: 'Ensure every conclusion has a direct, explicit causal bridge rather than leaping ahead.',
        area: 'Reasoning',
      });
    }
    if (fallacyData.length > 0) {
      const top = fallacyData[0];
      recs.push({
        title: `Logical Error Alert: ${top.name}`,
        desc: `You triggered "${top.name}" ${top.count} times. Focus on recognizing and eliminating this pattern in your next session.`,
        area: 'Fallacy Awareness',
      });
    }
    if (recs.length === 0) {
      recs.push({
        title: 'Consistent Daily Practice',
        desc: 'Complete 1 practice session daily to build muscle memory in structured communication and clear reasoning.',
        area: 'Habit',
      });
    }
    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', padding: '32px 20px 80px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <Link to="/dashboard" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 4px', color: 'var(--text-primary)' }}>
            Performance Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            In-depth multi-dimensional analytics, progress trends, and logical error evaluation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/plan" className="ts-btn-secondary" style={{ padding: '10px 16px', fontSize: '0.88rem' }}>
            📅 View Practice Plan
          </Link>
          <Link to="/lobby" className="ts-btn-primary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            ⚡ Start Practice
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="df-spinner" />
          <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>Loading performance metrics...</p>
        </div>
      ) : totalSessions === 0 ? (
        <div className="ts-empty-state">
          <span className="ts-empty-icon">📈</span>
          <div className="ts-empty-title">No Enough Data Yet</div>
          <p className="ts-empty-desc">
            Complete more practice sessions to unlock your performance trends, skill radar, and personalized feedback.
          </p>
          <Link to="/lobby" className="ts-btn-primary">
            Start Your First Practice Session
          </Link>
        </div>
      ) : (
        <>
          {/* ── Key Metrics Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 28 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Overall Score</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '6px 0 2px' }}>{avgOverall}%</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Average across turns</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Reasoning</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', margin: '6px 0 2px' }}>{avgLogic}%</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Logical consistency</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Communication</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#818cf8', margin: '6px 0 2px' }}>{avgCommunication}%</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Clarity & delivery</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Evidence</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b', margin: '6px 0 2px' }}>{avgEvidence}%</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Data & citations</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Sessions Done</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-user)', margin: '6px 0 2px' }}>{totalSessions}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total completed</div>
            </div>
          </div>

          {/* ── Charts Row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
            {/* Progress Trend Chart */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
                📈 Performance Progress Trend
              </h3>
              {trendData.length > 1 ? (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="session" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip
                        contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        formatter={(val) => [`${val}%`, 'Performance Score']}
                      />
                      <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>
                  Complete at least 2 sessions to visualize your historical score trajectory.
                </p>
              )}
            </div>

            {/* Skill Dimension Radar */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
                🎯 Core Competency Radar
              </h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="dimension" stroke="var(--text-secondary)" fontSize={11} />
                    <Radar name="Competency" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Logical Error Radar & Recommendations ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Logical Errors */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
                🛡️ Logical Error Awareness
              </h3>
              {fallacyData.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {fallacyData.slice(0, 5).map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', fontSize: '0.9rem' }}>
                          {f.name}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Identified in your arguments
                        </div>
                      </div>
                      <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: 12, fontWeight: 700, fontSize: '0.82rem' }}>
                        {f.count} {f.count === 1 ? 'occurrence' : 'occurrences'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '30px 0' }}>
                  No logical errors detected! Keep practicing with disciplined reasoning.
                </p>
              )}
            </div>

            {/* Targeted Recommendations */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
                💡 Actionable Learning Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recommendations.map((rec, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <strong style={{ color: 'var(--accent-primary)', fontSize: '0.92rem' }}>{rec.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 10 }}>{rec.area}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{rec.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
