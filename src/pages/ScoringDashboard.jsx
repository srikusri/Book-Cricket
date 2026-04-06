import React from 'react';
import { useMatch } from '../context/MatchContext';

const ScoringDashboard = () => {
  const { matchState, teams, handlePageFlip } = useMatch();
  const innings = matchState.innings[matchState.currentInnings - 1];
  const battingTeam = teams[innings.battingTeam];
  const currentBatter = battingTeam.players[matchState.currentBatterIdx];

  const { recordBall } = useMatch();

  const scoreButtons = [
    { value: 1, label: 'Single', color: 'bg-surface-container-highest', textColor: 'text-on-surface' },
    { value: 2, label: 'Double', color: 'bg-surface-container-highest', textColor: 'text-on-surface' },
    { value: 'W', label: 'Out', color: 'bg-error-container', textColor: 'text-on-error-container', icon: 'close' },
    { value: 4, label: 'Boundary', color: 'bg-gradient-to-br from-primary to-primary-container', textColor: 'text-on-primary', isLarge: true },
    { value: 6, label: 'Maximum', color: 'bg-tertiary-container', textColor: 'text-on-tertiary-container', isLarge: true },
    { value: 8, label: 'Ultra Run', color: 'bg-surface-container-highest', textColor: 'text-on-surface', isLegacy: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scoreboard Module */}
      <section className="bg-surface-container rounded-lg p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-9xl">scoreboard</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <span className="font-label text-sm uppercase tracking-widest text-on-surface-variant">Innings {matchState.currentInnings}</span>
            <div className="flex items-baseline gap-2">
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-on-surface">
                {innings.totalRuns}<span className="text-primary">/{innings.wickets}</span>
              </h1>
            </div>
            <p className="text-xl font-bold text-on-surface-variant mt-2">{battingTeam.name}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-surface-container-highest px-4 py-2 rounded-full mb-2">
              <span className="text-on-surface-variant font-bold">
                CRR: {innings.balls > 0 ? ((innings.totalRuns / innings.balls) * 6).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-on-surface">{innings.overs}.{innings.balls % 6}</span>
              <span className="text-sm font-medium text-on-surface-variant block uppercase tracking-widest">Overs</span>
            </div>
          </div>
        </div>

        {/* Recent Balls Track */}
        <div className="mt-8 flex items-center gap-3 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase mr-2 shrink-0">Last 6:</span>
          <div className="flex items-center gap-2">
            {innings.recentBalls.slice(-6).map((ball, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  ball === 'W' ? 'bg-error-container text-on-error-container' :
                  ball === 4 ? 'bg-primary text-white' :
                  ball === 6 ? 'bg-tertiary-container text-on-tertiary-container' :
                  'bg-surface-container-highest text-on-surface'
                }`}
              >
                {ball}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-secondary border-dashed flex items-center justify-center text-secondary animate-pulse shrink-0">
              <span className="material-symbols-outlined text-sm">bolt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Player Stats Focus */}
      <div className="grid grid-cols-1 gap-4">
        {/* Batter Focus */}
        <div className="bg-surface-container-low p-6 rounded-lg flex justify-between items-center border border-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">{currentBatter?.name || 'Waiting...'}*</h3>
              <p className="text-sm text-on-surface-variant">
                {innings.battingStats[currentBatter?.id]?.runs || 0} ({innings.battingStats[currentBatter?.id]?.balls || 0})
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex gap-1 mb-1 justify-end">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="w-2 h-2 rounded-full bg-outline-variant opacity-30"></span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant">
              S/R {innings.battingStats[currentBatter?.id]?.balls > 0 ? ((innings.battingStats[currentBatter?.id]?.runs / innings.battingStats[currentBatter?.id]?.balls) * 100).toFixed(1) : '0.0'}
            </span>
          </div>
        </div>
      </div>

      {/* Tactile Scoring Console */}
      <section className="space-y-4 pt-4">
        <div className="flex justify-between items-center px-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Tap to Score</h2>
            <button
                onClick={handlePageFlip}
                className="bg-primary text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-md active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-sm">auto_stories</span>
                Flip Page
            </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {scoreButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => recordBall(btn.value)}
              className={`${btn.color} ${btn.textColor} ${btn.isLarge ? 'h-32 shadow-lg' : 'h-32'} rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 hover:brightness-95 group relative overflow-hidden`}
            >
              {btn.isLegacy && (
                <div className="absolute top-2 right-2 bg-on-surface/10 px-2 py-0.5 rounded text-[8px] font-black">LEGACY</div>
              )}
              <span className={`${btn.isLarge ? 'text-5xl' : 'text-4xl'} font-black group-active:scale-90 transition-transform`}>
                {btn.value}
              </span>
              <span className="text-[10px] font-bold uppercase mt-1 opacity-70">
                {btn.label}
              </span>
              {btn.icon && (
                <span className="material-symbols-outlined text-sm mt-1">{btn.icon}</span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="h-16 bg-surface-container-low border-2 border-outline-variant/20 rounded-full flex items-center justify-center gap-3 transition-all active:scale-95 text-on-surface/70 hover:text-on-surface">
            <span className="material-symbols-outlined">undo</span>
            <span className="font-bold text-sm">Undo Ball</span>
          </button>
          <button className="h-16 bg-surface-container-low border-2 border-outline-variant/20 rounded-full flex items-center justify-center gap-3 transition-all active:scale-95 text-on-surface/70 hover:text-on-surface">
            <span className="material-symbols-outlined">more_horiz</span>
            <span className="font-bold text-sm">Extras</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ScoringDashboard;
