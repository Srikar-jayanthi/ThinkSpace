import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppNavbar.css';

const NAV_LINKS = [
  { path: '/dashboard',   icon: '📊', label: 'Dashboard' },
  { path: '/lobby',       icon: '⚡', label: 'Practice Arena' },
  { path: '/performance', icon: '📈', label: 'Performance' },
  { path: '/plan',        icon: '📅', label: 'Practice Plan' },
  { path: '/history',     icon: '📜', label: 'History' },
  { path: '/leaderboard', icon: '🏆', label: 'Rankings' },
];

export default function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = location.pathname;
  const isDebateRoom = pathname.startsWith('/debate/');
  const isLandingPage = pathname === '/';
  const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-email-otp'].includes(pathname) ||
    pathname.startsWith('/reset-password');

  // On the landing page, the LandingPage component has its own landing navbar.
  if (isLandingPage) {
    return null;
  }

  // When active in a practice room, provide a clean, focused, distraction-free top bar
  if (isDebateRoom) {
    return (
      <header className="app-navbar app-navbar--minimal" aria-label="Session Navigation">
        <div className="app-navbar-container">
          <div className="app-navbar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <span className="app-navbar-logo">💡</span>
            <span className="app-navbar-name">ThinkSpace</span>
            <span className="app-navbar-tag">Live Session</span>
          </div>
          <div className="app-navbar-actions">
            <button
              type="button"
              className="app-nav-exit-btn"
              onClick={() => {
                if (window.confirm('Do you want to return to the Dashboard? Your session will be safely preserved.')) {
                  navigate('/dashboard');
                }
              }}
            >
              ← Exit to Dashboard
            </button>
          </div>
        </div>
      </header>
    );
  }

  // If on login/register pages, show a clean, simple branding bar
  if (isAuthPage) {
    return (
      <header className="app-navbar app-navbar--auth" aria-label="Auth Navigation">
        <div className="app-navbar-container">
          <Link to="/" className="app-navbar-brand">
            <span className="app-navbar-logo">💡</span>
            <span className="app-navbar-name">ThinkSpace</span>
          </Link>
          <div className="app-navbar-actions">
            {pathname === '/login' ? (
              <Link to="/register" className="app-nav-link-btn">Create Account</Link>
            ) : (
              <Link to="/login" className="app-nav-link-btn">Sign In</Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Authenticated Global Top Navigation
  return (
    <header className="app-navbar" aria-label="Main Application Header">
      <div className="app-navbar-container">
        {/* Brand / Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="app-navbar-brand">
          <span className="app-navbar-logo">💡</span>
          <span className="app-navbar-name">ThinkSpace</span>
        </Link>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="app-navbar-links" aria-label="Primary Navigation">
            {NAV_LINKS.map(({ path, icon, label }) => {
              const isActive = pathname === path ||
                (path === '/lobby' && pathname === '/practice');
              return (
                <Link
                  key={path}
                  to={path}
                  className={`app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="app-nav-link-icon">{icon}</span>
                  <span className="app-nav-link-text">
                    {label === 'Practice Arena' ? (
                      <>
                        <span className="app-nav-text-full">Practice Arena</span>
                        <span className="app-nav-text-short">Practice</span>
                      </>
                    ) : label === 'Practice Plan' ? (
                      <>
                        <span className="app-nav-text-full">Practice Plan</span>
                        <span className="app-nav-text-short">Plan</span>
                      </>
                    ) : (
                      label
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions & User Profile */}
        <div className="app-navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Badges */}
              <div className="app-nav-badges">
                <span className="app-nav-badge app-nav-badge--streak" title="Daily Practice Streak">
                  🔥 {user?.streak?.current || 0}d
                </span>
                <span className="app-nav-badge app-nav-badge--elo" title="Communication Elo Rating">
                  ⭐ {user?.eloRating || 1000}
                </span>
              </div>

              {/* Start Practice CTA (shown on secondary pages, omitted on /dashboard and /lobby where hero CTA exists) */}
              {pathname !== '/lobby' && pathname !== '/dashboard' && (
                <Link to="/lobby" className="app-nav-cta-btn" title="Jump to Practice Arena">
                  <span>⚡</span>
                  <span className="app-nav-cta-text">Start Practice</span>
                </Link>
              )}

              {/* Profile Link */}
              <Link
                to="/profile"
                className={`app-nav-user-pill ${pathname === '/profile' ? 'app-nav-user-pill--active' : ''}`}
                title="View Profile & Settings"
              >
                <span className="app-nav-avatar">👤</span>
                <span className="app-nav-username">{user?.username || 'Thinker'}</span>
              </Link>

              {/* Logout button */}
              <button
                type="button"
                className="app-nav-logout-btn"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign out of ThinkSpace"
              >
                <span className="app-nav-logout-icon">↪</span>
                <span className="app-nav-logout-text">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="app-nav-guest">
              <Link to="/login" className="app-nav-link-btn">Sign In</Link>
              <Link to="/register" className="app-nav-cta-btn">Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          {isAuthenticated && (
            <button
              type="button"
              className="app-nav-mobile-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="app-navbar-mobile-drawer">
          <nav className="app-mobile-nav">
            {NAV_LINKS.map(({ path, icon, label }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`app-mobile-link ${isActive ? 'app-mobile-link--active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="app-mobile-icon">{icon}</span>
                  <span>{label}</span>
                </Link>
              );
            })}
            <div className="app-mobile-divider" />
            <Link
              to="/profile"
              className="app-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="app-mobile-icon">👤</span>
              <span>Profile & Settings ({user?.username || 'Thinker'})</span>
            </Link>
            <button
              type="button"
              className="app-mobile-logout"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
                navigate('/login');
              }}
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
