import { useState } from 'react';

export function AuthPage({ onAuth }) {
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [info,     setInfo]     = useState('');

  const handle = async () => {
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await (mode === 'login'
        ? onAuth.signIn(email, password)
        : onAuth.signUp(email, password));
      if (res.error) throw res.error;
      if (mode === 'signup') setInfo('Vérifie ta boîte mail pour confirmer le compte.');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box animate-fadeUp">
        <div className="auth-logo">⚡ NutriTrack</div>
        <div className="auth-sub">Ton suivi santé — adapté à ta réalité</div>

        {error && <div className="auth-alert auth-alert--error">{error}</div>}
        {info  && <div className="auth-alert auth-alert--info">{info}</div>}

        <label className="field-label">Email</label>
        <input className="field-input" type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" />

        <label className="field-label">Mot de passe</label>
        <input className="field-input" type="password" value={password}
          onChange={e => setPassword(e.target.value)} placeholder="••••••••"
          onKeyDown={e => e.key === 'Enter' && handle()} />

        <button className="btn-primary" onClick={handle} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
        </button>

        <p className="auth-switch">
          {mode === 'login'
            ? <>Pas de compte ? <span onClick={() => setMode('signup')}>S'inscrire</span></>
            : <>Déjà inscrit ? <span onClick={() => setMode('login')}>Se connecter</span></>}
        </p>
      </div>
    </div>
  );
}
