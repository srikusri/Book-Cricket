import React, { createContext, useContext, useState, useCallback } from 'react';

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
  });

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

      // Initialize batting stats for the first batter
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
      };
    });
    setGamePhase('match');
  }, [teams]);

  const recordBall = useCallback((ballResult) => {
    setMatchState(prev => {
      if (prev.isMatchOver) return prev;

      const currentInningsIdx = prev.currentInnings - 1;
      const currentInningsState = prev.innings[currentInningsIdx];

      // Safety guard: Ensure batting team is set
      if (!currentInningsState.battingTeam) return prev;

      const innings = { ...currentInningsState };
      const battingTeam = teams[innings.battingTeam];
      const currentBatter = battingTeam.players[prev.currentBatterIdx];

      if (!currentBatter) return prev;
      const batterId = currentBatter.id;

      let { totalRuns, wickets, balls, overs, recentBalls, battingStats } = innings;
      let { currentBatterIdx, currentInnings, isMatchOver } = prev;

      // Update balls and overs
      balls += 1;
      if (balls % 6 === 0) {
        overs += 1;
      }

      // Update batting stats for current ball
      battingStats = { ...battingStats };
      if (!battingStats[batterId]) {
        battingStats[batterId] = { runs: 0, balls: 0 };
      }
      battingStats[batterId].balls += 1;

      if (ballResult === 'W' || ballResult === 0) {
        wickets += 1;
        recentBalls = [...recentBalls, 'W'];

        // Corrected logic: Up to 10 wickets are possible (11 players)
        if (wickets < 10) {
          currentBatterIdx += 1;
          const nextBatter = battingTeam.players[currentBatterIdx];
          if (nextBatter) {
            battingStats[nextBatter.id] = { runs: 0, balls: 0 };
          }
        }
      } else {
        totalRuns += ballResult;
        recentBalls = [...recentBalls, ballResult];
        battingStats[batterId].runs += ballResult;
      }

      const isInningsOver = wickets >= 10 || overs >= matchConfig.overs;

      if (isInningsOver) {
        if (currentInnings === 1) {
          currentInnings = 2;
          currentBatterIdx = 0;
          // Initialize next innings batting stats
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
            innings: [ { ...innings, totalRuns, wickets, balls, overs, recentBalls, battingStats }, nextInnings ]
          };
        } else {
          isMatchOver = true;
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
        isMatchOver
      };
    });
  }, [teams, matchConfig.overs]);

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
    recordBall
  };

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
};
