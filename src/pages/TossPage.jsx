import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import { motion } from 'framer-motion';

const TossPage = () => {
  const { teams, startMatch } = useMatch();
  const [isFlipping, setIsFlipping] = useState(false);
  const [tossResult, setTossResult] = useState(null); // 'home' or 'away'
  const [decision, setDecision] = useState(null); // 'bat' or 'bowl'

  const handleFlip = () => {
    setIsFlipping(true);
    setTossResult(null);
    setDecision(null);

    setTimeout(() => {
      const result = Math.random() > 0.5 ? 'home' : 'away';
      setTossResult(result);
      setIsFlipping(false);
    }, 2000);
  };

  return (
    <div className="flex-grow pt-8 pb-32 px-4 max-w-4xl mx-auto w-full">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black tracking-tight mb-2">The Big Toss</h1>
        <p className="text-on-surface-variant font-medium">Captain's call to decide the match fate</p>
      </div>

      {/* Bento Grid for Toss Interaction */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Team 1 Side */}
        <div className={`md:col-span-4 flex flex-col items-center justify-center p-8 bg-surface-container rounded-lg relative overflow-hidden group transition-all ${tossResult === 'home' ? 'ring-4 ring-primary' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 border-4 border-primary/20">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <h3 className="text-xl font-bold text-center">{teams.home.name || 'Team Alpha'}</h3>
          <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full mt-2 uppercase tracking-widest">Home Team</span>
        </div>

        {/* Central Coin Flip Area */}
        <div className="md:col-span-4 flex flex-col items-center justify-between p-8 bg-surface-container-high rounded-xl border-b-4 border-primary-dim shadow-xl">
          <div className="flex flex-col items-center gap-6 w-full">
            {/* The "Physically" Layered Coin Container */}
            <div className="w-40 h-40 rounded-full bg-tertiary-container flex items-center justify-center relative shadow-lg">
              <motion.div
                animate={isFlipping ? { rotateY: 1800 } : { rotateY: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-tertiary-fixed to-tertiary-fixed-dim flex items-center justify-center shadow-inner relative z-20"
              >
                <span className="material-symbols-outlined text-6xl text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
              </motion.div>
              <div className="absolute inset-2 rounded-full border-4 border-dashed border-tertiary/30 animate-[spin_10s_linear_infinite]"></div>
            </div>

            <button
              onClick={handleFlip}
              disabled={isFlipping}
              className="w-full py-4 px-8 bg-gradient-to-r from-primary to-primary-container text-white font-black text-xl rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {isFlipping ? 'Flipping...' : 'Flip Coin'}
            </button>
          </div>
        </div>

        {/* Team 2 Side */}
        <div className={`md:col-span-4 flex flex-col items-center justify-center p-8 bg-surface-container rounded-lg relative overflow-hidden group transition-all ${tossResult === 'away' ? 'ring-4 ring-secondary' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 border-4 border-secondary/20">
            <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <h3 className="text-xl font-bold text-center">{teams.away.name || 'Team Beta'}</h3>
          <span className="text-xs font-bold bg-secondary/10 text-secondary px-3 py-1 rounded-full mt-2 uppercase tracking-widest">Away Team</span>
        </div>

        {/* Choice Selector (Appears after flip simulation) */}
        {tossResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-12 glass-panel p-8 rounded-lg mt-4 border border-primary/20"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h4 className="text-2xl font-bold">Selection Needed</h4>
                <p className="text-on-surface-variant">
                  <span className="font-bold text-primary">{teams[tossResult].name}</span> won the toss! Choose to Bat or Bowl.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center p-2 bg-surface rounded-full shadow-sm border border-outline-variant/10">
                  <button
                    onClick={() => setDecision('bat')}
                    className={`px-8 py-3 rounded-full font-bold transition-all ${decision === 'bat' ? 'bg-primary text-white shadow-md' : 'text-on-surface hover:bg-surface-container-high'}`}
                  >
                    Bat
                  </button>
                  <button
                    onClick={() => setDecision('bowl')}
                    className={`px-8 py-3 rounded-full font-bold transition-all ${decision === 'bowl' ? 'bg-primary text-white shadow-md' : 'text-on-surface hover:bg-surface-container-high'}`}
                  >
                    Bowl
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Final CTA */}
        {decision && (
          <div className="md:col-span-12 flex justify-center mt-6">
            <button
              onClick={() => startMatch(tossResult, decision)}
              className="group flex items-center gap-3 px-12 py-5 bg-on-surface text-surface font-black text-2xl rounded-full shadow-2xl hover:bg-primary transition-all active:scale-95"
            >
              Start Match
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">sports_cricket</span>
            </button>
          </div>
        )}
      </div>

      {/* Decorative Scorecard Element Tuck */}
      <div className="fixed right-[-40px] top-1/2 -rotate-12 hidden lg:block opacity-40">
        <div className="bg-surface-container-highest w-64 p-6 rounded-md shadow-2xl border-l-8 border-primary">
          <div className="h-4 w-32 bg-primary/20 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-2 w-full bg-primary/10 rounded"></div>
            <div className="h-2 w-full bg-primary/10 rounded"></div>
            <div className="h-2 w-3/4 bg-primary/10 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TossPage;
