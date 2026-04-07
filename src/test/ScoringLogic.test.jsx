import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MatchProvider, useMatch } from '../context/MatchContext';

const Wrapper = ({ children }) => <MatchProvider>{children}</MatchProvider>;

describe('Cricket Scoring Logic', () => {
  it('should end match immediately when target reached in second innings', () => {
    const { result } = renderHook(() => useMatch(), { wrapper: Wrapper });

    // First Innings
    act(() => {
      result.current.startMatch('home', 'bat');
    });

    // Score 10 runs in first innings
    act(() => {
      result.current.recordBall(6);
      result.current.recordBall(4);
    });

    // Force end first innings (using overs = 2 default, so 12 balls needed or logic trigger)
    // Actually let's just use the target logic
    const firstInningsScore = result.current.matchState.innings[0].totalRuns; // 10

    // Fast forward to 2nd innings by finishing first
    for(let i=0; i<10; i++) {
        act(() => { result.current.recordBall(0); }); // Wickets
    }

    expect(result.current.matchState.currentInnings).toBe(2);

    // Second Innings: Target is 11
    act(() => {
      result.current.recordBall(6);
    });
    expect(result.current.matchState.isMatchOver).toBe(false);

    act(() => {
      result.current.recordBall(6); // Total 12, target 11 reached
    });

    expect(result.current.matchState.isMatchOver).toBe(true);
    expect(result.current.gamePhase).toBe('summary');
  });

  it('should handle extras correctly (run added, ball not counted)', () => {
    const { result } = renderHook(() => useMatch(), { wrapper: Wrapper });

    act(() => {
      result.current.startMatch('home', 'bat');
    });

    const initialBalls = result.current.matchState.innings[0].balls;

    act(() => {
      result.current.recordBall('WD');
    });

    expect(result.current.matchState.innings[0].totalRuns).toBe(1);
    expect(result.current.matchState.innings[0].balls).toBe(initialBalls);
    expect(result.current.matchState.innings[0].extras.total).toBe(1);
  });
});
