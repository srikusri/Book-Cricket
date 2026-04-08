import React from 'react';
import { useMatch } from '../context/MatchContext';

const InningsBreakPage = () => {
  const { matchState, teams, startSecondInnings, matchConfig } = useMatch();

  const firstInnings = matchState.innings[0];
  const firstBattingTeam = firstInnings?.battingTeam ? teams[firstInnings.battingTeam] : null;

  const secondInnings = matchState.innings[1];
  const secondBattingTeam = secondInnings?.battingTeam ? teams[secondInnings.battingTeam] : null;

  const target = (firstInnings?.totalRuns || 0) + 1;

  if (!firstBattingTeam || !secondBattingTeam) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-on-surface-variant font-bold">Innings data not found. Please restart the match.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <section className="relative overflow-hidden rounded-lg bg-surface-container-high p-8 flex flex-col items-center justify-center text-center gap-6">
        <div className="z-10">
          <span className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-4 inline-block">Innings Break</span>
          <h1 className="text-4xl md:text-6xl font-black text-on-surface leading-tight tracking-tighter mb-2 uppercase">
            {firstBattingTeam.name} <span className="text-primary italic">Innings Over</span>
          </h1>
          <div className="flex items-baseline justify-center gap-2 mt-4">
            <span className="text-7xl font-black text-on-surface">{firstInnings.totalRuns}</span>
            <span className="text-3xl font-bold text-on-surface-variant">/ {firstInnings.wickets}</span>
          </div>
          <p className="text-xl text-on-surface-variant font-medium mt-2">{firstInnings.overs}.{firstInnings.balls % 6} Overs Played</p>
        </div>

        <div className="z-10 w-full max-w-md bg-surface-container-lowest p-8 rounded-2xl shadow-sm border-2 border-primary/10">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Target for {secondBattingTeam.name}</h2>
          <div className="text-5xl font-black text-on-surface mb-1">{target} Runs</div>
          <p className="text-on-surface-variant text-sm">Required in {matchConfig.overs} overs</p>
        </div>

        <div className="z-10 pt-4">
          <button
            onClick={startSecondInnings}
            className="celebration-gradient text-on-primary px-12 py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-150"
          >
            <span className="material-symbols-outlined text-3xl">bolt</span>
            Start Second Innings
          </button>
          <p className="mt-4 text-outline font-bold text-xs uppercase tracking-widest">Get ready to flip the pages!</p>
        </div>
      </section>

      {/* Mini Scorecard for 1st Innings */}
      <div className="bg-surface-container rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="text-on-surface-variant text-sm font-bold uppercase tracking-widest mb-6">First Innings Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-end gap-4 px-2 border-b border-on-surface/5 pb-2">
            <span className="text-[10px] font-bold text-outline uppercase w-8 text-right">R</span>
            <span className="text-[10px] font-bold text-outline uppercase w-8 text-right">B</span>
            <span className="text-[10px] font-bold text-outline uppercase w-10 text-right">SR</span>
          </div>
          {firstBattingTeam.players.map((player) => {
            const stats = firstInnings.battingStats[player.id];
            const didNotBat = !stats;

            return (
              <div key={player.id} className={`flex items-center justify-between ${didNotBat ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${didNotBat ? 'bg-outline-variant' : 'bg-primary/40'}`}></span>
                  <p className="font-bold text-on-surface text-sm">
                    {player.name || `Player ${player.id}`} {didNotBat && '(DNB)'}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="w-8 text-right font-black text-on-surface text-sm">{didNotBat ? '-' : stats.runs}</span>
                  <span className="w-8 text-right font-medium text-on-surface-variant text-sm">{didNotBat ? '-' : stats.balls}</span>
                  <span className="w-10 text-right font-medium text-outline text-[10px]">
                    {!didNotBat && stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InningsBreakPage;
