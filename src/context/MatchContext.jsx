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
  fallOfWickets: [],
  extras: { wd: 0, nb: 0, total: 0 }
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
    const isInningsOver = innings.wickets >= 10 || innings.balls >= (matchConfig.overs * 6) || isTargetReached;

    if (isInningsOver) {
      if (matchState.currentInnings === 1) {
        setMatchState(prev => {
            const nextBattingTeamSide = prev.innings[1].battingTeam;
            const firstBatter = teams[nextBattingTeamSide].players[0];
            const nextInnings = { ...prev.innings[1] };
            if (firstBatter) {
              nextInnings.battingStats = {
                [firstBatter.id]: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' }
              };
            }
            return {
              ...prev,
              currentInnings: 2,
              currentBatterIdx: 0,
              innings: [ prev.innings[0], nextInnings ]
            };
        });
        setGamePhase('inningsBreak');
      } else {
        setMatchState(prev => ({ ...prev, isMatchOver: true }));

        const r1 = matchState.innings[0].totalRuns;
        const r2 = innings.totalRuns;
        let margin = '';
        let winnerName = '';

        if (r2 > r1) {
            winnerName = teams[innings.battingTeam].name;
            const wLeft = 10 - innings.wickets;
            margin = `won by ${wLeft} wicket${wLeft > 1 ? 's' : ''}`;
        } else if (r1 > r2) {
            winnerName = teams[matchState.innings[0].battingTeam].name;
            const rDiff = r1 - r2;
            margin = `won by ${rDiff} run${rDiff > 1 ? 's' : ''}`;
        } else {
            winnerName = 'Tie';
            margin = 'Match Drawn';
        }

        const matchRecord = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          teams: { home: teams.home.name, away: teams.away.name },
          scores: [
            { team: teams[matchState.innings[0].battingTeam].name, runs: matchState.innings[0].totalRuns, wickets: matchState.innings[0].wickets },
            { team: teams[innings.battingTeam].name, runs: innings.totalRuns, wickets: innings.wickets }
          ],
          winner: winnerName,
          margin: margin
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
        { ...createInningsState(firstBattingTeam), battingStats: { [teams[firstBattingTeam].players[0].id]: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' } } },
        createInningsState(secondBattingTeam)
      ],
      currentBatterIdx: 0,
      isMatchOver: false,
      ballHistory: [],
    });
    setGamePhase('match');
  }, [teams]);

  const startSecondInnings = useCallback(() => {
    setGamePhase('match');
  }, []);

  const recordBall = useCallback((ballResult) => {
    setMatchState(prev => {
      if (prev.isMatchOver) return prev;

      const currentInningsIdx = prev.currentInnings - 1;
      const innings = { ...prev.innings[currentInningsIdx] };

      if (!innings.battingTeam) return prev;

      const battingTeam = teams[innings.battingTeam];
      let { currentBatterIdx } = prev;

      const currentBatter = battingTeam.players[currentBatterIdx];
      if (!currentBatter) return prev;
      const batterId = currentBatter.id;

      let { totalRuns, wickets, balls, overs, recentBalls, battingStats, extras, fallOfWickets } = JSON.parse(JSON.stringify(innings));

      const isExtra = ballResult === 'WD' || ballResult === 'NB';

      if (!isExtra) {
        balls += 1;
      }

      if (!battingStats[batterId]) {
        battingStats[batterId] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' };
      }

      if (!isExtra) {
        battingStats[batterId].balls += 1;
      }

      if (ballResult === 'W' || ballResult === 0) {
        wickets += 1;
        recentBalls.push('W');
        battingStats[batterId].isOut = true;
        battingStats[batterId].howOut = 'b Page 0';

        const overCount = Math.floor((balls-1) / 6);
        const ballCount = (balls-1) % 6 + 1;
        fallOfWickets.push({
            runs: totalRuns,
            wicket: wickets,
            over: `${overCount}.${ballCount}`,
            batter: currentBatter.name || `Player ${currentBatter.id}`
        });

        if (wickets < 10) {
          currentBatterIdx += 1;
          const nextBatter = battingTeam.players[currentBatterIdx];
          if (nextBatter) {
            battingStats[nextBatter.id] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' };
          }
        }
      } else if (isExtra) {
        totalRuns += 1;
        extras.total += 1;
        if (ballResult === 'WD') extras.wd += 1;
        if (ballResult === 'NB') extras.nb += 1;
        recentBalls.push(ballResult === 'WD' ? 'Wd' : 'Nb');
      } else {
        totalRuns += ballResult;
        recentBalls.push(ballResult);
        battingStats[batterId].runs += ballResult;
        if (ballResult === 4) battingStats[batterId].fours += 1;
        if (ballResult === 6 || ballResult === 8) battingStats[batterId].sixes += 1;
      }

      overs = Math.floor(balls / 6);

      const updatedInnings = { ...innings, totalRuns, wickets, balls, overs, recentBalls, battingStats, extras, fallOfWickets };
      const newInningsList = [...prev.innings];
      newInningsList[currentInningsIdx] = updatedInnings;

      const { ballHistory: _, ...snapshot } = prev;
      return {
        ...prev,
        innings: newInningsList,
        currentBatterIdx,
        ballHistory: [...prev.ballHistory, JSON.parse(JSON.stringify(snapshot))]
      };
    });
  }, [teams]);

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
