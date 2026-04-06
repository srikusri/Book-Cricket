import React from 'react';
import { MatchProvider, useMatch } from './context/MatchContext';
import Layout from './components/Layout';
import RulesPage from './pages/RulesPage';
import SignupPage from './pages/SignupPage';
import TossPage from './pages/TossPage';
import ScoringDashboard from './pages/ScoringDashboard';
import SummaryPage from './pages/SummaryPage';

// Placeholder Pages

const GameRouter = () => {
  const { gamePhase } = useMatch();

  switch (gamePhase) {
    case 'rules':
      return <RulesPage />;
    case 'signup':
      return <SignupPage />;
    case 'toss':
      return <TossPage />;
    case 'match':
      return <ScoringDashboard />;
    case 'summary':
      return <SummaryPage />;
    default:
      return <RulesPage />;
  }
};

const App = () => {
  return (
    <MatchProvider>
      <Layout>
        <GameRouter />
      </Layout>
    </MatchProvider>
  );
};

export default App;
