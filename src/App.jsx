import './styles/globals.css';
import './styles/app.css';

import { useAuth }                        from './hooks/useAuth';
import { useFoodLogs }                    from './hooks/useFoodLogs';
import { useActivityLogs, useWeightLogs } from './hooks/useDataLogs';

import { AuthPage }      from './pages/AuthPage';
import { Dashboard }     from './pages/Dashboard';
import { FoodLog }       from './pages/FoodLog';
import { Activity, WeightTracker } from './pages/OtherPages';
import { CardioPage }    from './pages/CardioPage';
import { HistoryPage }   from './pages/HistoryPage';

import { useState } from 'react';

const TABS = [
  { id: 'home',     icon: '🏠', label: 'Accueil'  },
  { id: 'food',     icon: '🍽️', label: 'Repas'    },
  { id: 'activity', icon: '⚡', label: 'Activité' },
  { id: 'history',  icon: '📈', label: 'Historique'},
  { id: 'cardio',   icon: '🏃', label: 'Cardio'   },
];

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [tab, setTab] = useState('home');

  const { logs, add: addFood, addMany: addManyFood, remove: removeFood } = useFoodLogs(user?.id);
  const { logs: actLogs, add: addActivity, remove: removeActivity }      = useActivityLogs(user?.id);
  const { weights, add: addWeight }                                       = useWeightLogs(user?.id);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--green)', fontFamily: 'var(--font-data)', fontSize: 15 }}>
      Chargement...
    </div>
  );

  if (!user) return <AuthPage onAuth={{ signIn, signUp }} />;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-logo">⚡ NutriTrack</div>
          <div className="app-date">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <button className="btn-logout" onClick={signOut}>Déconnexion</button>
      </header>

      <main className="app-main">
        {tab === 'home'     && <Dashboard    foodLogs={logs} activityLogs={actLogs} weights={weights} />}
        {tab === 'food'     && <FoodLog      logs={logs} onAdd={addFood} onAddMany={addManyFood} onDelete={removeFood} />}
        {tab === 'activity' && <Activity     activityLogs={actLogs} onAdd={addActivity} onDelete={removeActivity} />}
        {tab === 'history'  && <HistoryPage  foodLogs={logs} activityLogs={actLogs} weights={weights} />}
        {tab === 'cardio'   && <CardioPage />}
      </main>

      <nav className="app-nav">
        {TABS.map(t => (
          <button key={t.id} className={`nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
