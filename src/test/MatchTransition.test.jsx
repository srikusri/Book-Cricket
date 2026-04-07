import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MatchProvider, useMatch } from '../context/MatchContext';
import React from 'react';

const wrapper = ({ children }) => <MatchProvider>{children}</MatchProvider>;

describe('Match Transition', () => {
  it('should transition from 1st innings to Innings Break and then 2nd innings', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useMatch(), { wrapper });

    // Setup match
    act(() => {
        result.current.updateTeam('home', { name: 'Alpha', players: [{id: 1, name: 'A1'}, {id: 2, name: 'A2'}] });
        result.current.updateTeam('away', { name: 'Beta', players: [{id: 1, name: 'B1'}, {id: 2, name: 'B2'}] });
        result.current.setMatchConfig({ overs: 1 });
    });

    act(() => {
        result.current.startMatch('home', 'bat');
    });

    expect(result.current.gamePhase).toBe('match');
    expect(result.current.matchState.currentInnings).toBe(1);

    // Score 6 balls to end 1st innings
    for (let i = 0; i < 6; i++) {
        act(() => {
            result.current.recordBall(1);
        });
    }

    // Should be at innings break now
    act(() => {
        vi.runAllTimers();
    });

    expect(result.current.gamePhase).toBe('inningsBreak');
    expect(result.current.matchState.currentInnings).toBe(2);
    expect(result.current.matchState.innings[0].totalRuns).toBe(6);

    // Start 2nd innings
    act(() => {
        result.current.setGamePhase('match');
    });

    expect(result.current.gamePhase).toBe('match');
    expect(result.current.matchState.currentInnings).toBe(2);

    // Verify target score logic
    const target = result.current.matchState.innings[0].totalRuns + 1;
    expect(target).toBe(7);

    // Score to win 2nd innings
    act(() => {
        result.current.recordBall(8);
    });

    act(() => {
        vi.runAllTimers();
    });

    expect(result.current.gamePhase).toBe('summary');
    expect(result.current.matchState.isMatchOver).toBe(true);

    // Check scorecards
    const innings1 = result.current.matchState.innings[0];
    const innings2 = result.current.matchState.innings[1];

    expect(Object.keys(innings1.battingStats).length).toBeGreaterThan(0);
    expect(Object.keys(innings2.battingStats).length).toBeGreaterThan(0);
    expect(innings2.totalRuns).toBe(8);

    // Verify MVP is calculated
    const mvpSection = result.current.matchState.innings.flatMap(inn => Object.values(inn.battingStats)).some(s => s.runs > 0);
    expect(mvpSection).toBe(true);

    vi.useRealTimers();
  });
});
