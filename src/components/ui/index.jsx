// ─── Card ─────────────────────────────────────────────────────────
export function Card({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

// ─── CardLabel ────────────────────────────────────────────────────
export function CardLabel({ children }) {
  return <p className="card-label">{children}</p>;
}

// ─── ProgressBar ──────────────────────────────────────────────────
export function ProgressBar({ value, max, color = 'green' }) {
  const pct = Math.min((value / max) * 100, 100);
  const colors = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)', blue: 'var(--blue)' };
  return (
    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: colors[color] ?? colors.green, borderRadius: 3, transition: 'width 0.5s ease' }} />
    </div>
  );
}

// ─── CalRing ──────────────────────────────────────────────────────
export function CalRing({ consumed, target }) {
  const pct    = Math.min(consumed / target, 1);
  const r      = 40;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color  = consumed > target ? 'var(--red)' : consumed > target * 0.85 ? 'var(--amber)' : 'var(--green)';

  return (
    <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
      <circle cx="46" cy="46" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
      <circle cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 46 46)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="46" y="42" textAnchor="middle" fill={color} fontSize="13" fontWeight="700" fontFamily="Space Grotesk">
        {Math.round(pct * 100)}%
      </text>
      <text x="46" y="55" textAnchor="middle" fill="var(--text-3)" fontSize="8.5" fontFamily="DM Sans">
        de l'objectif
      </text>
    </svg>
  );
}

// ─── Badge ────────────────────────────────────────────────────────
export function Badge({ children, color = 'green' }) {
  const map = {
    green: { bg: 'var(--green-bg)', text: 'var(--green)', border: 'var(--green-dim)' },
    amber: { bg: 'var(--amber-bg)', text: 'var(--amber)', border: '#78450a' },
    red:   { bg: 'var(--red-bg)',   text: 'var(--red)',   border: '#7f1d1d' },
  };
  const c = map[color] ?? map.green;
  return (
    <span style={{
      display: 'inline-block', background: c.bg, color: c.text,
      border: `1px solid ${c.border}`, borderRadius: 20,
      fontSize: 11, fontWeight: 600, padding: '2px 9px',
    }}>
      {children}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid var(--border)`,
      borderTopColor: 'var(--green)',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  );
}

// ─── EmptyState ───────────────────────────────────────────────────
export function EmptyState({ icon, label }) {
  return (
    <div style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-3)', fontSize: 13 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      {label}
    </div>
  );
}
