import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

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

const createInningsState = (battingTeamSide = null) => ({
  battingTeam: battingTeamSide,
  totalRuns: 0,
  wickets: 0,
  overs: 0,
  balls: 0,
  recentBalls: [],
  battingStats: {},
});

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
    innings: [ createInningsState(), createInningsState() ],
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

  // Handle game phase transitions based on match state
  useEffect(() => {
    if (gamePhase !== 'match' || matchState.isMatchOver) return;

    const currentInningsIdx = matchState.currentInnings - 1;
    const innings = matchState.innings[currentInningsIdx];
    if (!innings || !innings.battingTeam) return;

    const target = matchState.currentInnings === 2 ? matchState.innings[0].totalRuns + 1 : null;
    const isTargetReached = target !== null && innings.totalRuns >= target;
    const isInningsOver = innings.wickets >= 10 || innings.overs >= matchConfig.overs || isTargetReached;

    if (isInningsOver) {
      if (matchState.currentInnings === 1) {
        setGamePhase('inningsBreak');
      } else {
        setMatchState(prev => ({ ...prev, isMatchOver: true }));

        const matchRecord = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          teams: { home: teams.home.name, away: teams.away.name },
          scores: [
            { team: teams[matchState.innings[0].battingTeam].name, runs: matchState.innings[0].totalRuns, wickets: matchState.innings[0].wickets },
            { team: teams[innings.battingTeam].name, runs: innings.totalRuns, wickets: innings.wickets }
          ],
          winner: innings.totalRuns > matchState.innings[0].totalRuns ? teams[innings.battingTeam].name : (matchState.innings[0].totalRuns > innings.totalRuns ? teams[matchState.innings[0].battingTeam].name : 'Tie')
        };

        setHistory(h => {
          if (h.find(r => r.id === matchRecord.id)) return h;
          return [matchRecord, ...h];
        });

        setGamePhase('summary');
      }
    }
  }, [matchState, matchConfig.overs, gamePhase, teams]);

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

    setMatchState({
      currentInnings: 1,
      innings: [
        { ...createInningsState(firstBattingTeam), battingStats: { [teams[firstBattingTeam].players[0].id]: { runs: 0, balls: 0 } } },
        createInningsState(secondBattingTeam)
      ],
      currentBatterIdx: 0,
      isMatchOver: false,
      ballHistory: [],
    });
    setGamePhase('match');
  }, [teams]);

  const startSecondInnings = useCallback(() => {
    setMatchState(prev => {
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
        currentInnings: 2,
        currentBatterIdx: 0,
        innings: [ prev.innings[0], nextInnings ]
      };
    });
    setGamePhase('match');
  }, [teams]);

  const recordBall = useCallback((ballResult) => {
    setMatchState(prev => {
      if (prev.isMatchOver) return prev;

      const currentInningsIdx = prev.currentInnings - 1;
      const innings = { ...prev.innings[currentInningsIdx] };

      if (!innings.battingTeam) return prev;

      const battingTeam = teams[innings.battingTeam];
      let { currentBatterIdx, currentInnings } = prev;

      const currentBatter = battingTeam.players[currentBatterIdx];
      if (!currentBatter) return prev;
      const batterId = currentBatter.id;

      let { totalRuns, wickets, balls, overs, recentBalls, battingStats } = innings;
      battingStats = { ...battingStats };

      const isExtra = ballResult === 'WD' || ballResult === 'NB';

      if (!isExtra) {
        balls += 1;
        if (balls % 6 === 0) overs += 1;
      }

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

      const updatedInnings = { ...innings, totalRuns, wickets, balls, overs, recentBalls, battingStats };
      const newInningsList = [...prev.innings];
      newInningsList[currentInningsIdx] = updatedInnings;

      return {
        ...prev,
        innings: newInningsList,
        currentBatterIdx,
        ballHistory: [...prev.ballHistory, JSON.parse(JSON.stringify(prev))]
      };
    });
  }, [teams, matchConfig.overs]);

  const undoBall = useCallback(() => {
    setMatchState(prev => {
      if (prev.ballHistory.length === 0) return prev;
      const historyCopy = [...prev.ballHistory];
      const lastState = historyCopy.pop();
      return { ...lastState, ballHistory: historyCopy };
    });
  }, []);

  const handlePageFlip = useCallback(() => {
    const options = [0, 1, 2, 4, 6, 8];
    const result = options[Math.floor(Math.random() * options.length)];
    recordBall(result === 0 ? 'W' : result);
  }, [recordBall]);

  const value = useMemo(() => ({
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
    startSecondInnings,
    handlePageFlip,
    recordBall,
    undoBall,
    history
  }), [gamePhase, teams, updateTeam, matchConfig, toss, matchState, startMatch, startSecondInnings, handlePageFlip, recordBall, undoBall, history]);

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
};
