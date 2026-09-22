import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';
import * as AuthContextModule from '../context/AuthContext';

describe('AppNavbar', () => {
  it('renders branding and primary links for authenticated user', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { username: 'Srikar', eloRating: 1250, streak: { current: 5 } },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppNavbar />
      </MemoryRouter>
    );

    expect(screen.getByText('ThinkSpace')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Practice Arena')).toBeDefined();
    expect(screen.getByText('Performance')).toBeDefined();
    expect(screen.getByText('Practice Plan')).toBeDefined();
    expect(screen.getByText('History')).toBeDefined();
    expect(screen.getByText('Rankings')).toBeDefined();
    expect(screen.getByText('Srikar')).toBeDefined();
  });

  it('renders minimal distraction-free bar during live debate session', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { username: 'Srikar' },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/debate/12345']}>
        <AppNavbar />
      </MemoryRouter>
    );

    expect(screen.getByText('ThinkSpace')).toBeDefined();
    expect(screen.getByText('Live Session')).toBeDefined();
    expect(screen.getByText('← Exit to Dashboard')).toBeDefined();
  });
});
