import React from 'react';
import { useMatch } from '../context/MatchContext';

const TopAppBar = () => {
  const { gamePhase, setGamePhase, toss, matchState } = useMatch();

  const canNavigateToToss = toss.winner !== null || gamePhase === 'toss' || gamePhase === 'match' || gamePhase === 'summary';
  const canNavigateToArena = (matchState.innings[0].battingTeam !== null) || gamePhase === 'match' || gamePhase === 'summary';
  const canNavigateToSummary = matchState.isMatchOver || gamePhase === 'summary';

  const isPhaseDisabled = (phase) => {
    if (phase === 'toss') return !canNavigateToToss;
    if (phase === 'arena') return !canNavigateToArena;
    if (phase === 'history') return !canNavigateToSummary;
    return false;
  };

  return (
    <header className="bg-surface-bright dark:bg-emerald-950 flex justify-between items-center w-full px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-black text-on-surface dark:text-surface-bright font-headline tracking-tight">BookCricket Elite</span>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        {['arena', 'teams', 'toss', 'rules', 'history'].map((phase) => (
          <button
            key={phase}
            disabled={isPhaseDisabled(phase)}
            onClick={() => setGamePhase(phase === 'arena' ? 'match' : (phase === 'teams' ? 'signup' : (phase === 'history' ? 'summary' : phase)))}
            className={`text-on-surface dark:text-surface-variant font-headline tracking-tight transition-colors active:scale-95 duration-200 capitalize ${
              (gamePhase === phase ||
               (gamePhase === 'signup' && phase === 'teams') ||
               (gamePhase === 'match' && phase === 'arena') ||
               (gamePhase === 'summary' && phase === 'history'))
              ? 'text-primary dark:text-primary-fixed font-bold border-b-2 border-primary'
              : 'opacity-70 hover:bg-surface-container'
            } ${isPhaseDisabled(phase) ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {phase}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-surface-container text-primary dark:text-primary-fixed transition-all">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button className="p-2 rounded-full hover:bg-surface-container text-primary dark:text-primary-fixed transition-all">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </div>
    </header>
  );
};

const BottomNavBar = () => {
  const { gamePhase, setGamePhase, toss, matchState } = useMatch();

  const canNavigateToToss = toss.winner !== null || gamePhase === 'toss' || gamePhase === 'match' || gamePhase === 'summary';
  const canNavigateToArena = (matchState.innings[0].battingTeam !== null) || gamePhase === 'match' || gamePhase === 'summary';
  const canNavigateToSummary = matchState.isMatchOver || gamePhase === 'summary';

  const navItems = [
    { id: 'match', label: 'Arena', icon: 'sports_cricket', disabled: !canNavigateToArena },
    { id: 'signup', label: 'Teams', icon: 'group', disabled: false },
    { id: 'toss', label: 'Toss', icon: 'toll', disabled: !canNavigateToToss },
    { id: 'rules', label: 'Rules', icon: 'menu_book', disabled: false },
    { id: 'summary', label: 'Summary', icon: 'assessment', disabled: !canNavigateToSummary },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-end px-4 pb-4 pt-2 md:hidden z-50 bg-surface/80 dark:bg-emerald-950/80 backdrop-blur-md border-t border-on-surface/10 shadow-lg rounded-t-[3rem]">
      {navItems.map((item) => (
        <button
          key={item.id}
          disabled={item.disabled}
          onClick={() => setGamePhase(item.id)}
          className={`flex flex-col items-center justify-center p-2 hover:opacity-80 transition-all active:scale-90 duration-150 ${
            gamePhase === item.id
            ? 'bg-gradient-to-tr from-primary to-primary-container text-white rounded-full p-3 mb-1 w-12 h-12 shadow-lg'
            : 'text-on-surface dark:text-surface-variant'
          } ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className={`font-headline text-[10px] uppercase tracking-wider font-semibold ${gamePhase === item.id ? 'hidden' : ''}`}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container">
      <TopAppBar />
      <main className="max-w-5xl mx-auto px-4 pt-8 pb-32">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default Layout;
