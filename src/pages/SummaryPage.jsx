import React from 'react';
import { useMatch } from '../context/MatchContext';

const SummaryPage = () => {
  const { matchState, teams } = useMatch();

  const innings1 = matchState.innings[0];
  const innings2 = matchState.innings[1];

  const team1 = teams[innings1.battingTeam];
  const team2 = teams[innings2.battingTeam];

  const getWinnerInfo = () => {
    const runs1 = innings1.totalRuns;
    const runs2 = innings2.totalRuns;

    if (runs2 > runs1) {
        const wicketsLeft = 10 - innings2.wickets;
        return {
            name: team2.name,
            margin: `won by ${wicketsLeft} wicket${wicketsLeft > 1 ? 's' : ''}`,
            isTie: false
        };
    } else if (runs1 > runs2) {
        const runMargin = runs1 - runs2;
        return {
            name: team1.name,
            margin: `won by ${runMargin} run${runMargin > 1 ? 's' : ''}`,
            isTie: false
        };
    } else {
        return { name: 'MATCH TIED', margin: 'Match Drawn', isTie: true };
    }
  };

  const winner = getWinnerInfo();

  let mvp = { name: 'N/A', runs: 0, balls: 0, team: '' };
  [innings1, innings2].forEach((inn) => {
    const battingSide = inn.battingTeam;
    Object.entries(inn.battingStats).forEach(([playerId, stats]) => {
        if (stats.runs > mvp.runs) {
            const player = teams[battingSide].players.find(p => p.id === parseInt(playerId));
            mvp = { name: player?.name || 'Unknown', runs: stats.runs, balls: stats.balls, team: teams[battingSide].name };
        }
    });
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Victory Hero Section */}
      <section className="relative overflow-hidden rounded-lg bg-surface-container-high p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 celebration-gradient opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="z-10 text-center md:text-left">
          <span className="bg-tertiary-container text-on-tertiary-container px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-4 inline-block">Match Complete</span>
          <h1 className="text-4xl md:text-6xl font-black text-on-surface leading-tight tracking-tighter mb-2 uppercase">
            {winner.name}
          </h1>
          <p className="text-2xl text-primary font-black uppercase italic tracking-wide">{winner.margin}</p>
        </div>
        <div className="z-10 flex flex-col items-center justify-center bg-surface-container-lowest p-6 rounded-xl shadow-sm border-2 border-primary/10 min-w-[200px]">
          <span className="text-xs text-primary font-bold uppercase tracking-widest">Final Score ({team2.name})</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-6xl font-black text-on-surface">{innings2.totalRuns}</span>
            <span className="text-2xl font-bold text-on-surface-variant">/ {innings2.wickets}</span>
          </div>
          <span className="text-sm font-medium text-outline mt-1">{innings2.overs}.{innings2.balls % 6} Overs Played</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MVP Card */}
        <div className="lg:col-span-4 bg-surface-container-low rounded-lg p-6 flex flex-col justify-between border border-primary/5 h-fit">
          <div>
            <h3 className="text-on-surface-variant text-sm font-bold uppercase tracking-widest mb-4 border-b border-on-surface/5 pb-2">Player of Match</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center border-4 border-tertiary-fixed">
                <span className="material-symbols-outlined text-tertiary text-3xl">workspace_premium</span>
              </div>
              <div>
                <p className="text-xl font-bold text-on-surface">{mvp.name}</p>
                <p className="text-sm text-primary font-semibold">{mvp.runs} ({mvp.balls})</p>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">{mvp.team}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="bg-tertiary-container/30 text-on-tertiary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase">★ Match MVP</span>
            <span className="bg-primary-container/30 text-on-primary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase">★ Top Performer</span>
          </div>
        </div>

        {/* Detailed Scorecards */}
        <div className="lg:col-span-8 space-y-8">
          {[
            { team: team1, innings: innings1, title: 'First Innings' },
            { team: team2, innings: innings2, title: 'Second Innings' }
          ].map((item, idx) => (
            <div key={idx} className="bg-surface-container-low rounded-lg overflow-hidden border border-on-surface/5">
              <div className="bg-surface-container px-6 py-4 flex justify-between items-center border-b border-on-surface/5">
                <div>
                    <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{item.title}</h3>
                    <p className="font-black text-xl text-on-surface">{item.team.name}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-primary">{item.innings.totalRuns}/{item.innings.wickets}</p>
                    <p className="text-[10px] font-bold uppercase text-outline-variant">{item.innings.overs}.{item.innings.balls % 6} Overs</p>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-outline px-2 border-b border-on-surface/5 pb-2">
                      <div className="col-span-4">Batting</div>
                      <div className="col-span-3">Status</div>
                      <div className="col-span-1 text-right">R</div>
                      <div className="col-span-1 text-right">B</div>
                      <div className="col-span-1 text-right">4s</div>
                      <div className="col-span-1 text-right">6s</div>
                      <div className="col-span-1 text-right">SR</div>
                  </div>

                  {Object.entries(item.innings.battingStats).map(([playerId, stats]) => {
                    const player = item.team.players.find(p => p.id === parseInt(playerId));
                    return (
                      <div key={playerId} className="grid grid-cols-12 gap-2 px-2 items-center group border-b border-on-surface/5 pb-2 last:border-0">
                        <div className="col-span-4 font-bold text-on-surface text-sm">{player?.name || 'Unknown'}</div>
                        <div className="col-span-3 text-[10px] text-on-surface-variant uppercase font-medium">
                            {stats.isOut ? stats.howOut : 'not out'}
                        </div>
                        <div className="col-span-1 text-right font-black text-sm text-on-surface">{stats.runs}</div>
                        <div className="col-span-1 text-right text-on-surface-variant text-xs">{stats.balls}</div>
                        <div className="col-span-1 text-right text-on-surface-variant text-xs">{stats.fours}</div>
                        <div className="col-span-1 text-right text-on-surface-variant text-xs">{stats.sixes}</div>
                        <div className="col-span-1 text-right text-outline text-[10px]">
                          {stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0'}
                        </div>
                      </div>
                    );
                  })}

                  {/* Fall of Wickets */}
                  {item.innings.fallOfWickets.length > 0 && (
                      <div className="mt-4 px-2">
                          <p className="text-[10px] font-bold text-outline-variant uppercase mb-1">Fall of Wickets</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-on-surface-variant">
                              {item.innings.fallOfWickets.map((fow, fowIdx) => (
                                  <span key={fowIdx}>
                                      {fow.runs}-{fow.wicket} ({fow.batter}, {fow.over} ov)
                                      {fowIdx < item.innings.fallOfWickets.length - 1 ? ',' : ''}
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Did Not Bat */}
                  {(() => {
                      const battedIds = Object.keys(item.innings.battingStats).map(id => parseInt(id));
                      const dnb = item.team.players.filter(p => !battedIds.includes(p.id) && p.name.trim() !== '');
                      if (dnb.length > 0) {
                          return (
                            <div className="mt-2 px-2">
                                <p className="text-[10px] font-bold text-outline-variant uppercase">Did Not Bat</p>
                                <p className="text-[10px] text-on-surface-variant font-medium">
                                    {dnb.map(p => p.name).join(', ')}
                                </p>
                            </div>
                          );
                      }
                      return null;
                  })()}

                  <div className="mt-6 pt-4 border-t-2 border-dotted border-on-surface/10 flex justify-between items-center px-2">
                    <div className="flex gap-4">
                        <p className="text-[10px] font-bold text-outline-variant uppercase">Extras: <span className="text-on-surface font-black">{item.innings.extras.total}</span> <span className="text-[8px] opacity-60">(W {item.innings.extras.wd}, NB {item.innings.extras.nb})</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-outline-variant uppercase">Total Score</p>
                        <p className="text-xl font-black text-on-surface">{item.innings.totalRuns} <span className="text-sm font-medium text-on-surface-variant">({item.innings.wickets} wkts, {item.innings.overs}.{item.innings.balls % 6} ov)</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <button
          onClick={() => window.location.reload()}
          className="celebration-gradient text-on-primary px-10 py-5 rounded-xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-150"
        >
          <span className="material-symbols-outlined">add_circle</span>
          New Match
        </button>
        <button className="bg-surface-container-highest text-on-surface px-10 py-5 rounded-xl font-black text-lg flex items-center justify-center gap-3 border border-outline-variant/20 hover:bg-surface-variant active:scale-95 transition-all duration-150">
          <span className="material-symbols-outlined">share</span>
          Share Stats
        </button>
      </div>
    </div>
  );
};

export default SummaryPage;
