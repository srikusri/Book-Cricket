import React from 'react';
import { useMatch } from '../context/MatchContext';

const TeamCard = ({ side, title, type, color, bgColor, headerBgColor, team, updateTeam }) => {
  return (
    <div className={`${bgColor} rounded-lg overflow-hidden relative ${side === 'away' ? 'border-2 border-dashed border-secondary/20' : ''}`}>
      <div className={`${headerBgColor} px-8 py-6 flex justify-between items-center`}>
        <h2 className={`text-2xl font-bold ${side === 'home' ? 'text-on-primary-container' : 'text-on-secondary-container'}`}>{team.name || title}</h2>
        <span className={`${side === 'home' ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'} px-4 py-1 rounded-full text-sm font-bold capitalize`}>{type}</span>
      </div>
      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <label className={`text-xs font-bold uppercase tracking-widest ${color} mb-1 block px-2`}>Team Name</label>
            <input
              className="w-full bg-surface px-6 py-4 rounded-xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder-on-surface-variant/50 font-medium"
              placeholder={`e.g. ${side === 'home' ? 'Backbench Blazers' : 'Front Row Raiders'}`}
              type="text"
              value={team.name}
              onChange={(e) => updateTeam(side, { name: e.target.value })}
            />
          </div>
          <div className="relative">
            <label className={`text-xs font-bold uppercase tracking-widest ${color} mb-1 block px-2`}>Owner / Captain</label>
            <input
              className="w-full bg-surface px-6 py-4 rounded-xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder-on-surface-variant/50 font-medium"
              placeholder="Enter name"
              type="text"
              value={team.owner}
              onChange={(e) => updateTeam(side, { owner: e.target.value })}
            />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-on-surface-variant mb-4 px-2">Playing XI Players</h3>
          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
            {team.players.map((player, idx) => (
              <div key={player.id} className={`flex items-center gap-3 ${idx === 0 ? 'bg-surface-container-low' : 'bg-surface-container-lowest'} p-2 rounded-full pr-6 group hover:bg-surface-container-high transition-colors`}>
                <div className={`w-10 h-10 rounded-full ${idx === 0 ? (side === 'home' ? 'bg-primary text-white' : 'bg-secondary text-white') : 'bg-surface-container-highest text-primary'} flex items-center justify-center font-bold text-sm`}>
                  {String(player.id).padStart(2, '0')}
                </div>
                <input
                  className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-medium p-0"
                  placeholder="Player name"
                  type="text"
                  value={player.name}
                  onChange={(e) => {
                    const newPlayers = [...team.players];
                    newPlayers[idx] = { ...newPlayers[idx], name: e.target.value };
                    updateTeam(side, { players: newPlayers });
                  }}
                />
                <span className="material-symbols-outlined text-outline-variant opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SignupPage = () => {
  const { teams, updateTeam, matchConfig, setMatchConfig, setGamePhase } = useMatch();

  const overOptions = [2, 5, 10, 20];

  return (
    <div className="pb-32">
      {/* Hero Section */}
      <section className="mb-12 text-center md:text-left">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface mb-4">
          Register <span className="text-primary italic">Squads.</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Ready to turn the pages? Enter your team details and list your 11 classroom champions to begin the tournament.
        </p>
      </section>

      {/* Match Configuration Section */}
      <section className="mb-12 bg-surface-container-low p-6 md:p-8 rounded-lg border border-primary/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
              <span className="material-symbols-outlined">sports_cricket</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Match Configuration</h2>
              <p className="text-sm text-on-surface-variant font-medium">Define the length of your classroom battle</p>
            </div>
          </div>
          <div className="bg-surface rounded-2xl p-1.5 flex gap-1 shadow-inner border border-outline-variant/30">
            {overOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setMatchConfig({ ...matchConfig, overs: opt })}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${matchConfig.overs === opt ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                {opt} Overs
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <TeamCard
          side="home"
          title="Team Alpha"
          type="home"
          color="text-primary"
          bgColor="bg-surface-container"
          headerBgColor="bg-surface-container-highest"
          team={teams.home}
          updateTeam={updateTeam}
        />
        <TeamCard
          side="away"
          title="Team Beta"
          type="away"
          color="text-secondary"
          bgColor="bg-secondary-container/30"
          headerBgColor="bg-secondary-container"
          team={teams.away}
          updateTeam={updateTeam}
        />
      </div>

      {/* Decorative Illustration Area */}
      <div className="mt-16 grid grid-cols-3 gap-4 h-48">
        <div className="rounded-lg bg-cover bg-center col-span-2 shadow-inner bg-primary/20 flex items-center justify-center overflow-hidden">
             <span className="material-symbols-outlined text-9xl text-primary/10">sports_cricket</span>
        </div>
        <div className="bg-tertiary-container rounded-lg flex flex-col items-center justify-center text-on-tertiary-container p-6 text-center">
          <span className="material-symbols-outlined text-4xl mb-2">book_5</span>
          <p className="font-bold text-sm">Flip the Pages, Field the Wins.</p>
        </div>
      </div>

      {/* FAB for Success/Proceed */}
      <button
        onClick={() => setGamePhase('toss')}
        className="fixed bottom-28 right-8 bg-gradient-to-br from-primary to-primary-container text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-[60] group"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </button>
    </div>
  );
};

export default SignupPage;
