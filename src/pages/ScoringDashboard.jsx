import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import { motion, AnimatePresence } from 'framer-motion';

const ScoringDashboard = () => {
  const { matchState, teams, handlePageFlip, undoBall, recordBall, matchConfig } = useMatch();
  const innings = matchState.innings[matchState.currentInnings - 1];
  const battingTeam = teams[innings.battingTeam];
  const currentBatter = battingTeam.players[matchState.currentBatterIdx];

  const [showExtras, setShowExtras] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);

  const scoreButtons = [
    { value: 1, label: 'Single', color: 'bg-surface-container-highest', textColor: 'text-on-surface' },
    { value: 2, label: 'Double', color: 'bg-surface-container-highest', textColor: 'text-on-surface' },
    { value: 'W', label: 'Out', color: 'bg-error-container', textColor: 'text-on-error-container', icon: 'close' },
    { value: 4, label: 'Boundary', color: 'bg-gradient-to-br from-primary to-primary-container', textColor: 'text-on-primary', isLarge: true },
    { value: 6, label: 'Maximum', color: 'bg-tertiary-container', textColor: 'text-on-tertiary-container', isLarge: true },
    { value: 8, label: 'Ultra Run', color: 'bg-surface-container-highest', textColor: 'text-on-surface', isLegacy: true },
  ];

  const target = matchState.currentInnings === 2 ? matchState.innings[0].totalRuns + 1 : null;
  const runsNeeded = target !== null ? target - innings.totalRuns : null;
  const totalBalls = matchConfig.overs * 6;
  const ballsRemaining = totalBalls - innings.balls;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scoreboard Module */}
      <section className="bg-surface-container rounded-lg p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-9xl">scoreboard</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <span className="font-label text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                Innings {matchState.currentInnings}
                {target !== null && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        Target: {target}
                    </span>
                )}
            </span>
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

        {/* Chase Progress Overlay */}
        {target !== null && (
            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                    </div>
                    <div>
                        <p className="text-sm font-black text-on-surface uppercase tracking-tight">
                            {runsNeeded} Runs needed
                        </p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                            From {ballsRemaining} balls
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest">Req. Rate</p>
                    <p className="text-lg font-black text-primary">
                        {ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : '∞'}
                    </p>
                </div>
            </div>
        )}

        {/* Recent Balls Track */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 flex-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase mr-2 shrink-0">Last 6:</span>
            <div className="flex items-center gap-2">
                {innings.recentBalls.slice(-6).map((ball, idx) => (
                <div
                    key={idx}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    ball === 'W' ? 'bg-error-container text-on-error-container' :
                    ball === 4 ? 'bg-primary text-white' :
                    ball === 6 ? 'bg-tertiary-container text-on-tertiary-container' :
                    (ball === 'Wd' || ball === 'Nb') ? 'bg-secondary-container text-on-secondary-container' :
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
          <button
            onClick={() => setShowScorecard(true)}
            className="shrink-0 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">list_alt</span>
            Scorecard
          </button>
        </div>
      </section>

      {/* Player Stats Focus */}
      <div className="grid grid-cols-1 gap-4">
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
          <button
            onClick={undoBall}
            className="h-16 bg-surface-container-low border-2 border-outline-variant/20 rounded-full flex items-center justify-center gap-3 transition-all active:scale-95 text-on-surface/70 hover:text-on-surface"
          >
            <span className="material-symbols-outlined">undo</span>
            <span className="font-bold text-sm">Undo Ball</span>
          </button>
          <button
            onClick={() => setShowExtras(true)}
            className="h-16 bg-surface-container-low border-2 border-outline-variant/20 rounded-full flex items-center justify-center gap-3 transition-all active:scale-95 text-on-surface/70 hover:text-on-surface"
          >
            <span className="material-symbols-outlined">more_horiz</span>
            <span className="font-bold text-sm">Extras</span>
          </button>
        </div>
      </section>

      {/* Extras Modal */}
      <AnimatePresence>
        {showExtras && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExtras(false)}
              className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 bottom-8 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 bg-surface-container-lowest p-8 rounded-2xl shadow-2xl z-[80] border border-primary/10"
            >
              <h3 className="text-xl font-bold mb-6">Select Extra</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { recordBall('WD'); setShowExtras(false); }}
                  className="bg-secondary-container text-on-secondary-container p-6 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-transform"
                >
                  <span className="text-2xl font-black">WD</span>
                  <span className="text-[10px] font-bold uppercase mt-1">Wide Ball</span>
                </button>
                <button
                  onClick={() => { recordBall('NB'); setShowExtras(false); }}
                  className="bg-secondary-container text-on-secondary-container p-6 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-transform"
                >
                  <span className="text-2xl font-black">NB</span>
                  <span className="text-[10px] font-bold uppercase mt-1">No Ball</span>
                </button>
              </div>
              <button
                onClick={() => setShowExtras(false)}
                className="w-full mt-6 py-4 text-on-surface-variant font-bold uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mid-Match Scorecard Modal */}
      <AnimatePresence>
        {showScorecard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScorecard(false)}
              className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 max-h-[80vh] bg-surface-container-lowest rounded-t-3xl shadow-2xl z-[80] border-t border-primary/10 flex flex-col"
            >
              <div className="p-6 border-b border-on-surface/5 flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-widest">Match Scorecard</h3>
                <button onClick={() => setShowScorecard(false)} className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-8 pb-12">
                {[...matchState.innings].map((inn, innIdx) => {
                  if (!inn.battingTeam) return null;
                  const team = teams[inn.battingTeam];
                  return (
                    <div key={innIdx}>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-black text-lg text-primary">{team.name} <span className="text-xs text-on-surface-variant font-medium ml-2">Innings {innIdx + 1}</span></h4>
                        <div className="text-right">
                          <p className="font-black text-xl">{inn.totalRuns}/{inn.wickets}</p>
                          <p className="text-[10px] font-bold uppercase text-outline-variant">{inn.overs}.{inn.balls % 6} Overs</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-outline px-2 border-b border-on-surface/5 pb-1">
                          <div className="col-span-6 text-left">Batter</div>
                          <div className="col-span-2 text-right">R</div>
                          <div className="col-span-2 text-right">B</div>
                          <div className="col-span-2 text-right">SR</div>
                        </div>
                        {Object.entries(inn.battingStats).map(([playerId, stats]) => {
                          const player = team.players.find(p => p.id === parseInt(playerId));
                          const isCurrentlyBatting = innIdx === matchState.currentInnings - 1 && player?.id === battingTeam.players[matchState.currentBatterIdx].id;
                          return (
                            <div key={playerId} className={`grid grid-cols-12 gap-2 px-2 py-1 items-center ${isCurrentlyBatting ? 'bg-primary/5 rounded' : ''}`}>
                              <div className="col-span-6 text-sm font-bold text-on-surface truncate">
                                {player?.name || 'Unknown'} {isCurrentlyBatting && '*'}
                              </div>
                              <div className="col-span-2 text-right font-black text-sm">{stats.runs}</div>
                              <div className="col-span-2 text-right text-on-surface-variant text-xs">{stats.balls}</div>
                              <div className="col-span-2 text-right text-outline text-[10px]">
                                {stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(0) : '-'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScoringDashboard;
