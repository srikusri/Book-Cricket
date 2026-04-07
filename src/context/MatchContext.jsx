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

const createInningsState = () => ({
  battingTeam: null,
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
      const newInnings = [ createInningsState(), createInningsState() ];
      newInnings[0].battingTeam = firstBattingTeam;
      newInnings[1].battingTeam = secondBattingTeam;

      const firstBatterId = teams[firstBattingTeam].players[0].id;
      newInnings[0].battingStats = {
        [firstBatterId]: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' }
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
      // Deep copy nested objects
      innings.recentBalls = [...innings.recentBalls];
      innings.battingStats = JSON.parse(JSON.stringify(innings.battingStats));
      innings.fallOfWickets = [...innings.fallOfWickets];
      innings.extras = { ...innings.extras };

      const battingTeam = teams[innings.battingTeam];
      const currentBatter = battingTeam.players[prev.currentBatterIdx];

      if (!currentBatter) return prev;
      const batterId = currentBatter.id;

      let { totalRuns, wickets, balls, overs, recentBalls, battingStats, extras, fallOfWickets } = innings;
      let { currentBatterIdx, currentInnings, isMatchOver } = prev;

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
        if (ballResult === 6) battingStats[batterId].sixes += 1;
        if (ballResult === 8) battingStats[batterId].sixes += 1;
      }

      overs = Math.floor(balls / 6);

      const target = currentInnings === 2 ? prev.innings[0].totalRuns + 1 : null;
      const isTargetReached = target !== null && totalRuns >= target;
      const isInningsOver = wickets >= 10 || (balls >= matchConfig.overs * 6) || isTargetReached;

      if (isInningsOver) {
        if (currentInnings === 1) {
          const nextBattingTeamSide = prev.innings[1].battingTeam;
          const firstBatter = teams[nextBattingTeamSide].players[0];
          const nextInnings = createInningsState();
          nextInnings.battingTeam = nextBattingTeamSide;
          if (firstBatter) {
            nextInnings.battingStats = {
              [firstBatter.id]: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' }
            };
          }

          setTimeout(() => setGamePhase('inningsBreak'), 0);
          return {
            ...prev,
            currentInnings,
            currentBatterIdx,
            innings: [ { ...innings, totalRuns, wickets, balls, overs, recentBalls, battingStats, extras, fallOfWickets }, nextInnings ],
            ballHistory: newHistory
          };
        } else {
          isMatchOver = true;
          const finalInnings1 = prev.innings[0];
          const finalInnings2 = { ...innings, totalRuns, wickets, balls, overs, recentBalls, battingStats, extras, fallOfWickets };

          const getWinnerDetails = () => {
            const r1 = finalInnings1.totalRuns;
            const r2 = finalInnings2.totalRuns;
            if (r2 > r1) {
                const wLeft = 10 - finalInnings2.wickets;
                return { name: teams[finalInnings2.battingTeam].name, margin: `won by ${wLeft} wicket${wLeft > 1 ? 's' : ''}` };
            } else if (r1 > r2) {
                const rDiff = r1 - r2;
                return { name: teams[finalInnings1.battingTeam].name, margin: `won by ${rDiff} run${rDiff > 1 ? 's' : ''}` };
            } else {
                return { name: 'Tie', margin: 'Match Drawn' };
            }
          };

          const winnerInfo = getWinnerDetails();
          const matchRecord = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            teams: { home: teams.home.name, away: teams.away.name },
            scores: [
              { team: teams[finalInnings1.battingTeam].name, runs: finalInnings1.totalRuns, wickets: finalInnings1.wickets },
              { team: teams[finalInnings2.battingTeam].name, runs: totalRuns, wickets: wickets }
            ],
            winner: winnerInfo.name,
            margin: winnerInfo.margin
          };
          setHistory(h => [matchRecord, ...h]);
          setTimeout(() => setGamePhase('summary'), 0);

          const finalInnings = [...prev.innings];
          finalInnings[1] = { ...innings, totalRuns, wickets, balls, overs, recentBalls, battingStats };
          return {
            ...prev,
            innings: finalInnings,
            isMatchOver: true,
            ballHistory: newHistory
          };
        }
      }

      const newInnings = [...prev.innings];
      newInnings[currentInningsIdx] = { ...innings, totalRuns, wickets, balls, overs, recentBalls, battingStats, extras, fallOfWickets };

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
      const historySnapshot = [...prev.ballHistory];
      const lastState = historySnapshot.pop();
      return { ...lastState, ballHistory: historySnapshot };
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
