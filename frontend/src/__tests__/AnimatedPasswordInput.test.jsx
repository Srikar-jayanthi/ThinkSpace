import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnimatedPasswordInput from '../components/AnimatedPasswordInput';

function TestWrapper() {
  const [val, setVal] = useState('');
  return (
    <AnimatedPasswordInput
      id="test-pwd"
      placeholder="Enter password"
      value={val}
      onChange={(e) => setVal(e.target.value)}
    />
  );
}

describe('AnimatedPasswordInput (Native Cursor & Visibility Toggle)', () => {
  it('renders a native input with type="password" initially', () => {
    render(<TestWrapper />);
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toBeDefined();
    expect(input.getAttribute('type')).toBe('password');
  });

  it('toggles input type to "text" when the show button is clicked', () => {
    render(<TestWrapper />);
    const input = screen.getByPlaceholderText('Enter password');
    const toggleBtn = screen.getByRole('button', { name: /show password/i });

    expect(input.getAttribute('type')).toBe('password');
    fireEvent.click(toggleBtn);
    expect(input.getAttribute('type')).toBe('text');

    const hideBtn = screen.getByRole('button', { name: /hide password/i });
    fireEvent.click(hideBtn);
    expect(input.getAttribute('type')).toBe('password');
  });

  it('allows text typing and retains value', () => {
    render(<TestWrapper />);
    const input = screen.getByPlaceholderText('Enter password');
    fireEvent.change(input, { target: { value: 'Secret123!' } });
    expect(input.value).toBe('Secret123!');
  });
});
