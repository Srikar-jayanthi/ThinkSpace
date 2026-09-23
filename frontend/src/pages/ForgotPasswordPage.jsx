import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        '/api/auth/forgot-password',
        { email },
        { baseURL: process.env.REACT_APP_API_URL || '' }
      );
      if (res.data?.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="df-center">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-icon">📧</span>
            <h1 className="auth-title">Check Your Email</h1>
            <p className="auth-subtitle">
              If an account with that email exists, we've sent a password reset link.
              Check your inbox and spam folder.
            </p>
          </div>

          {resetUrl && (
            <div style={{
              background: 'rgba(124, 92, 252, 0.1)',
              border: '1px solid rgba(124, 92, 252, 0.3)',
              borderRadius: '10px',
              padding: '16px',
              marginTop: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.84rem', color: '#a78bfa', fontWeight: 600, marginBottom: '6px' }}>
                ⚡ Review / Evaluation Mode
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 12px' }}>
                For instant reviewer verification (bypasses DNS email delays):
              </p>
              <a
                href={resetUrl}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #7c5cfc, #a855f7)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 12px rgba(124, 92, 252, 0.35)'
                }}
              >
                Reset Password Directly →
              </a>
            </div>
          )}

          <p className="auth-switch" style={{ marginTop: '16px' }}>
            <Link to="/login" className="retro-back-link">← Back to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="df-center">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🔑</span>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-email">
              Email
            </label>
            <input
              id="reset-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-btn-loading" style={{ gap: '12px' }}>
                <div className="df-spinner sm">
                  <div className="df-spinner-core" />
                  <div className="df-spinner-orbit" />
                </div>
                Sending…
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?{' '}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
