import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const MatchContext = createContext();

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};

const initialTeamState = {
  name: '',
  owner: '',
  players: Array(11).fill('').map((_, i) => ({ id: i + 1, name: '' })),
};

const initialInningsState = {
  battingTeam: null,
  totalRuns: 0,
  wickets: 0,
  overs: 0,
  balls: 0,
  recentBalls: [],
  battingStats: {},
};

export const MatchProvider = ({ children }) => {
  const [gamePhase, setGamePhase] = useState('rules');
  const [teams, setTeams] = useState({
    home: { ...initialTeamState, name: 'Team Alpha' },
    away: { ...initialTeamState, name: 'Team Beta' },
  });
  const [matchConfig, setMatchConfig] = useState({ overs: 2 });
  const [toss, setToss] = useState({ winner: null, decision: null });

  const [matchState, setMatchState] = useState({
    currentInnings: 1,
    innings: [ { ...initialInningsState }, { ...initialInningsState } ],
    currentBatterIdx: 0,
    isMatchOver: false,
    ballHistory: [],
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('book_cricket_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('book_cricket_history', JSON.stringify(history));
  }, [history]);

  const updateTeam = useCallback((side, data) => {
    setTeams(prev => ({
      ...prev,
      [side]: { ...prev[side], ...data }
    }));
  }, []);

  const startMatch = useCallback((tossWinner, decision) => {
    if (!tossWinner || !decision) return;

    setToss({ winner: tossWinner, decision });

    const firstBattingTeam = decision === 'bat' ? tossWinner : (tossWinner === 'home' ? 'away' : 'home');
    const secondBattingTeam = firstBattingTeam === 'home' ? 'away' : 'home';

    setMatchState(prev => {
      const newInnings = [...prev.innings];
      newInnings[0].battingTeam = firstBattingTeam;
      newInnings[1].battingTeam = secondBattingTeam;

      const firstBatterId = teams[firstBattingTeam].players[0].id;
      newInnings[0].battingStats = {
        [firstBatterId]: { runs: 0, balls: 0 }
      };

      return {
        ...prev,
        innings: newInnings,
        currentBatterIdx: 0,
        currentInnings: 1,
        isMatchOver: false,
        ballHistory: [],
      };
    });
    setGamePhase('match');
  }, [teams]);

  const recordBall = useCallback((ballResult) => {
    setMatchState(prev => {
      if (prev.isMatchOver) return prev;

      const currentInningsIdx = prev.currentInnings - 1;
      const currentInningsState = prev.innings[currentInningsIdx];

      if (!currentInningsState.battingTeam) return prev;

      const snapshot = JSON.parse(JSON.stringify(prev));
      const newHistory = [...prev.ballHistory, snapshot];

      const innings = { ...currentInningsState };
      const battingTeam = teams[innings.battingTeam];
      const currentBatter = battingTeam.players[prev.currentBatterIdx];

      if (!currentBatter) return prev;
      const batterId = currentBatter.id;

      let { totalRuns, wickets, balls, overs, recentBalls, battingStats } = innings;
      let { currentBatterIdx, currentInnings, isMatchOver } = prev;

      const isExtra = ballResult === 'WD' || ballResult === 'NB';

      if (!isExtra) {
        balls += 1;
        if (balls % 6 === 0) {
          overs += 1;
        }
      }

      battingStats = { ...battingStats };
      if (!battingStats[batterId]) {
        battingStats[batterId] = { runs: 0, balls: 0 };
      }
      if (!isExtra) {
        battingStats[batterId].balls += 1;
      }

      if (ballResult === 'W' || ballResult === 0) {
        wickets += 1;
        recentBalls = [...recentBalls, 'W'];

        if (wickets < 10) {
          currentBatterIdx += 1;
          const nextBatter = battingTeam.players[currentBatterIdx];
          if (nextBatter) {
            battingStats[nextBatter.id] = { runs: 0, balls: 0 };
          }
        }
      } else if (isExtra) {
        totalRuns += 1;
        recentBalls = [...recentBalls, ballResult === 'WD' ? 'Wd' : 'Nb'];
      } else {
        totalRuns += ballResult;
        recentBalls = [...recentBalls, ballResult];
        battingStats[batterId].runs += ballResult;
      }

      const target = currentInnings === 2 ? prev.innings[0].totalRuns + 1 : null;
      const isTargetReached = target !== null && totalRuns >= target;
      const isInningsOver = wickets >= 10 || overs >= matchConfig.overs || isTargetReached;

      if (isInningsOver) {
        if (currentInnings === 1) {
          currentInnings = 2;
          currentBatterIdx = 0;
          const nextBattingTeamSide = prev.innings[1].battingTeam;
          const firstBatter = teams[nextBattingTeamSide].players[0];
          const nextInnings = { ...prev.innings[1] };
          if (firstBatter) {
            nextInnings.battingStats = {
              [firstBatter.id]: { runs: 0, balls: 0 }
            };
          }

          return {
            ...prev,
            currentInnings,
            currentBatterIdx,
            innings: [ { ...innings, totalRuns, wickets, balls, overs, recentBalls, battingStats }, nextInnings ],
            ballHistory: newHistory
          };
        } else {
          isMatchOver = true;
          // Save to history
          const matchRecord = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            teams: { home: teams.home.name, away: teams.away.name },
            scores: [
              { team: teams[prev.innings[0].battingTeam].name, runs: prev.innings[0].totalRuns, wickets: prev.innings[0].wickets },
              { team: teams[prev.innings[1].battingTeam].name, runs: totalRuns, wickets: wickets }
            ],
            winner: totalRuns > prev.innings[0].totalRuns ? teams[prev.innings[1].battingTeam].name : (prev.innings[0].totalRuns > totalRuns ? teams[prev.innings[0].battingTeam].name : 'Tie')
          };
          setHistory(h => [matchRecord, ...h]);
          setGamePhase('summary');
        }
      }

      const newInnings = [...prev.innings];
      newInnings[currentInningsIdx] = { ...innings, totalRuns, wickets, balls, overs, recentBalls, battingStats };

      return {
        ...prev,
        innings: newInnings,
        currentBatterIdx,
        currentInnings,
        isMatchOver,
        ballHistory: newHistory
      };
    });
  }, [teams, matchConfig.overs]);

  const undoBall = useCallback(() => {
    setMatchState(prev => {
      if (prev.ballHistory.length === 0) return prev;
      const history = [...prev.ballHistory];
      const lastState = history.pop();
      return { ...lastState, ballHistory: history };
    });
  }, []);

  const handlePageFlip = useCallback(() => {
    const options = [0, 1, 2, 4, 6, 8];
    const result = options[Math.floor(Math.random() * options.length)];
    recordBall(result === 0 ? 'W' : result);
  }, [recordBall]);

  const value = {
    gamePhase,
    setGamePhase,
    teams,
    updateTeam,
    matchConfig,
    setMatchConfig,
    toss,
    setToss,
    matchState,
    setMatchState,
    startMatch,
    handlePageFlip,
    recordBall,
    undoBall,
    history
  };

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
};
