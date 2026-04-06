import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MatchProvider, useMatch } from '../context/MatchContext';

const Wrapper = ({ children }) => <MatchProvider>{children}</MatchProvider>;

describe('MatchContext Logic', () => {
  it('should initialize with rules phase', () => {
    const { result } = renderHook(() => useMatch(), { wrapper: Wrapper });
    expect(result.current.gamePhase).toBe('rules');
  });

  it('should transition to signup phase', () => {
    const { result } = renderHook(() => useMatch(), { wrapper: Wrapper });
    act(() => {
      result.current.setGamePhase('signup');
    });
    expect(result.current.gamePhase).toBe('signup');
  });

  it('should handle page flip and record balls', () => {
    const { result } = renderHook(() => useMatch(), { wrapper: Wrapper });

    // Setup match
    act(() => {
      result.current.startMatch('home', 'bat');
    });

    expect(result.current.gamePhase).toBe('match');

    const initialBalls = result.current.matchState.innings[0].balls;

    act(() => {
      result.current.handlePageFlip();
    });

    expect(result.current.matchState.innings[0].balls).toBe(initialBalls + 1);
  });
});
