import React from 'react';
import { useMatch } from '../context/MatchContext';

const HistoryPage = () => {
  const { history, setGamePhase } = useMatch();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="text-center md:text-left">
        <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-2">
          Match <span className="text-primary italic">History.</span>
        </h1>
        <p className="text-on-surface-variant font-medium">Relive your classroom legends</p>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-surface-container rounded-lg p-12 text-center border-2 border-dashed border-outline-variant/30">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">history</span>
            <p className="text-on-surface-variant font-bold">No matches played yet.</p>
            <button
              onClick={() => setGamePhase('signup')}
              className="mt-6 bg-primary text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm shadow-lg active:scale-95 transition-transform"
            >
              Start First Match
            </button>
          </div>
        ) : (
          history.map((match) => (
            <div key={match.id} className="bg-surface-container-low rounded-xl p-6 border border-primary/5 hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-outline-variant uppercase tracking-widest">{match.date}</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${match.winner === 'Tie' ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-primary-container text-on-primary-container'}`}>
                  {match.winner === 'Tie' ? 'Draw' : `${match.winner} Won`}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {match.scores.map((score, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-lg">
                    <span className="font-bold text-on-surface">{score.team}</span>
                    <span className="text-2xl font-black text-primary">
                        {score.runs}<span className="text-sm text-on-surface-variant">/{score.wickets}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
