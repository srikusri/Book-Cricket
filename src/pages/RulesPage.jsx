import React from 'react';
import { useMatch } from '../context/MatchContext';

const RulesPage = () => {
  const { setGamePhase } = useMatch();

  const scoringRules = [
    { digit: '0', label: 'OUT!', color: 'text-error', bgColor: 'bg-error-container/10', borderColor: 'border-error/20', isDashed: true },
    { digit: '8', label: 'ULTRA RUN (8)', color: 'text-on-surface', bgColor: 'bg-surface-container' },
    { digit: '2', label: '2 RUNS', color: 'text-on-surface', bgColor: 'bg-surface-container' },
    { digit: '4', label: 'BOUNDARY', color: 'text-on-primary-container', bgColor: 'bg-primary-container' },
    { digit: '6', label: 'MAXIMUM', color: 'text-on-tertiary-container', bgColor: 'bg-tertiary-container', isFeatured: true },
  ];

  return (
    <div className="relative">
      {/* Scholastic Notebook Paper Aesthetic */}
      <div className="bg-surface-container-lowest rounded-lg shadow-xl overflow-hidden border-l-[12px] border-secondary-dim/20 relative">
        {/* Vertical Margin Line */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-error/30 z-10"></div>

        {/* Header Area */}
        <div className="bg-surface-container-high px-8 py-10 pl-20 relative z-20">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-on-surface tracking-tighter mb-2">Rules of the Game</h1>
              <p className="text-on-surface-variant font-medium uppercase tracking-widest text-sm italic">Subject: Physical Education - Tabletop Division</p>
            </div>
            <div className="hidden sm:block">
              <div className="bg-tertiary-container p-4 rounded-lg transform rotate-3 shadow-md">
                <span className="material-symbols-outlined text-on-tertiary-container text-4xl">menu_book</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rules Content - Notebook Grid */}
        <div className="px-8 py-12 pl-20 notebook-line min-h-[500px]">
          <div className="space-y-10">
            {/* Rule 1 */}
            <div className="flex gap-8 items-start group">
              <span className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors">01</span>
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">The Opening Flip</h3>
                <p className="text-body-lg text-on-surface-variant leading-relaxed">Each player flips a random page in the book. This physical act represents the delivery and the stroke. The book must be flicked naturally with the thumb.</p>
              </div>
            </div>

            {/* Rule 2: Scoring Grid */}
            <div className="flex gap-8 items-start">
              <span className="text-4xl font-black text-primary/20">02</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-on-surface mb-4">The Digital Scorecard</h3>
                <p className="text-on-surface-variant mb-6">The score is determined by the <strong>last digit</strong> of the page number on the right-hand side:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pr-8">
                  {scoringRules.map((rule) => (
                    <div
                      key={rule.digit}
                      className={`${rule.bgColor} p-4 rounded-xl flex flex-col items-center ${rule.borderColor ? `border-2 ${rule.borderColor}` : ''} ${rule.isDashed ? 'border-dashed' : ''} ${rule.isFeatured ? 'transform scale-105 shadow-lg border-2 border-tertiary-fixed' : ''}`}
                    >
                      <span className={`text-3xl font-black ${rule.color} mb-1`}>{rule.digit}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${rule.color === 'text-on-surface' ? 'text-on-surface-variant' : rule.color}`}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-8 items-start group">
              <span className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors">03</span>
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">End of Innings</h3>
                <p className="text-body-lg text-on-surface-variant leading-relaxed">A player's turn (innings) ends immediately if they flip a page ending in <span className="text-error font-bold italic">0</span>. All previous runs are tallied into the team total.</p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-8 items-start group">
              <span className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors">04</span>
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">Victory Condition</h3>
                <p className="text-body-lg text-on-surface-variant leading-relaxed">After both sides have completed their designated overs or lost all wickets, the team with the <strong>most runs</strong> wins the match. In case of a tie, a "One Page Flip-off" determines the winner.</p>
              </div>
            </div>
          </div>

          {/* Decorative Graphic */}
          <div className="mt-16 pr-8 opacity-40 grayscale flex justify-end">
            <div className="w-64 h-40 bg-surface-container-highest rounded-2xl transform rotate-2 flex items-center justify-center border-2 border-dashed border-outline">
                <span className="material-symbols-outlined text-6xl text-outline-variant">import_contacts</span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-8 flex justify-center items-center bg-surface-container-low border-t border-outline-variant/10">
          <button
            onClick={() => setGamePhase('signup')}
            className="bg-gradient-to-tr from-primary to-primary-container text-white px-12 py-5 rounded-xl font-black text-xl uppercase tracking-tighter shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>

      {/* Asymmetric "Sticky Note" Detail */}
      <div className="absolute -right-8 top-1/4 hidden lg:block w-48 p-4 bg-tertiary-container shadow-xl rounded-lg transform -rotate-6 z-30">
        <p className="text-xs font-black text-on-tertiary-container uppercase tracking-widest mb-2 border-b border-on-tertiary-container/20 pb-1">Pro Tip</p>
        <p className="text-sm font-bold text-on-tertiary-container/80 leading-snug">Don't use the index or cover pages — they don't count towards the score!</p>
        <div className="mt-2 text-right">
          <span className="material-symbols-outlined text-on-tertiary-container/30">edit</span>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;
