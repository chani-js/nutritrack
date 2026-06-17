import { useState } from 'react';
import { Card, CardLabel, Badge, EmptyState } from '../components/ui/index';

// ─── ACTIVITY ─────────────────────────────────────────────────────
const ACTIVITIES = [
  { name: 'Marche (5 km/h)',            calPerMin: 4.5 },
  { name: 'Vélo léger (niveau 1-2)',    calPerMin: 5   },
  { name: 'Vélo modéré (niveau 4-6)',   calPerMin: 7   },
  { name: 'Vélo intensif (niveau 7+)',  calPerMin: 9   },
  { name: 'Natation',                   calPerMin: 8   },
  { name: 'Musculation',                calPerMin: 5   },
  { name: 'Étirements / yoga',          calPerMin: 2.5 },
];

export function Activity({ activityLogs, onAdd, onDelete }) {
  const [actIdx,    setActIdx]    = useState(1);
  const [duration,  setDuration]  = useState(30);

  const act       = ACTIVITIES[actIdx];
  const estimated = Math.round(act.calPerMin * duration);
  const today     = new Date().toISOString().split('T')[0];
  const todayLogs = activityLogs.filter(a => a.date === today);
  const totalBurned = todayLogs.reduce((s, a) => s + a.calories_burned, 0);

  const add = () => onAdd({
    activity_name:  act.name,
    duration_min:   duration,
    calories_burned: estimated,
    date: today,
  });

  return (
    <div className="page-content">
      <div className="page-title">Activité <Badge color="amber">-{totalBurned} kcal</Badge></div>

      <Card>
        <CardLabel>Enregistrer une activité</CardLabel>
        <div>
          <label className="field-label">Type d'activité</label>
          <select className="field-select" value={actIdx} onChange={e => setActIdx(Number(e.target.value))}>
            {ACTIVITIES.map((a, i) => <option key={i} value={i}>{a.name}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <label className="field-label">Durée — {duration} min</label>
          <input type="range" min="5" max="120" step="5" value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            style={{ width: '100%', marginTop: 6 }} />
        </div>
        <div className="estimate-box" style={{ marginTop: 10 }}>
          Estimation : <strong style={{ color: 'var(--green)', fontFamily: 'var(--font-data)' }}>{estimated} kcal</strong> brûlées
        </div>
        <button className="btn-primary" style={{ marginTop: 8 }} onClick={add}>Ajouter</button>
      </Card>

      <Card>
        <CardLabel>Activités du jour</CardLabel>
        {todayLogs.length === 0
          ? <EmptyState icon="🏃" label="Aucune activité enregistrée" />
          : todayLogs.map((a, i) => (
            <div key={i} className="list-row">
              <div>
                <div className="list-name">{a.activity_name}</div>
                <div className="list-sub">{a.duration_min} minutes</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="list-val" style={{ color: 'var(--green)' }}>-{a.calories_burned} kcal</span>
                <button className="btn-icon-del" onClick={() => onDelete(a.id)}>✕</button>
              </div>
            </div>
          ))
        }
      </Card>

      <Card style={{ borderColor: 'var(--green-dim)' }}>
        <CardLabel>Conseil adapté</CardLabel>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
          Monte progressivement à niveau 4-5 sur le vélo pour doubler les calories brûlées sans forcer les articulations. La régularité prime sur l'intensité.
        </p>
      </Card>
    </div>
  );
}

// ─── WEIGHT TRACKER ───────────────────────────────────────────────
const START_WEIGHT = 121;

export function WeightTracker({ weights, onAdd }) {
  const [val, setVal] = useState('');
  const sorted  = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const latest  = sorted.at(-1)?.weight ?? START_WEIGHT;
  const lost    = START_WEIGHT - latest;

  const submit = () => {
    if (!val) return;
    onAdd({ weight: parseFloat(val), date: new Date().toISOString().split('T')[0] });
    setVal('');
  };

  return (
    <div className="page-content">
      <div className="page-title">Poids</div>

      <Card>
        <CardLabel>Enregistrer mon poids</CardLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'flex-end' }}>
          <div>
            <label className="field-label">Poids (kg)</label>
            <input className="field-input" type="number" step="0.1" placeholder="ex: 120.5" value={val}
              onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <button className="btn-primary" style={{ height: 40, padding: '0 16px' }} onClick={submit}>OK</button>
        </div>
      </Card>

      {lost > 0 && (
        <div className="highlight-box">
          <div style={{ fontFamily: 'var(--font-data)', fontSize: 28, fontWeight: 700, color: 'var(--green)' }}>-{lost.toFixed(1)} kg</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>perdus depuis le début · objectif 100 kg</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>encore {(latest - 100).toFixed(1)} kg à perdre</div>
        </div>
      )}

      <Card>
        <CardLabel>Historique</CardLabel>
        {sorted.length === 0
          ? <EmptyState icon="⚖️" label="Aucune mesure enregistrée" />
          : sorted.slice(-15).reverse().map((w, i, arr) => {
              const prev = arr[i + 1];
              const diff = prev ? w.weight - prev.weight : 0;
              return (
                <div key={i} className="list-row">
                  <span className="list-sub" style={{ fontSize: 13 }}>
                    {new Date(w.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-data)', fontWeight: 600 }}>{w.weight} kg</span>
                    {diff !== 0 && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: diff < 0 ? 'var(--green)' : 'var(--red)' }}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}kg
                      </span>
                    )}
                  </div>
                </div>
              );
            })
        }
      </Card>
    </div>
  );
}

// ─── MEAL PLAN ────────────────────────────────────────────────────
const PLAN = [
  {
    day: 'Lundi',
    meals: [
      { name: 'Petit-déjeuner', items: ['Yaourt grec 0% (100g)', 'Banane', 'Café sans sucre'], cal: 148 },
      { name: 'Déjeuner',       items: ['Blanc de poulet (100g)', 'Riz cuit (100g)', 'Légumes verts'], cal: 295 },
      { name: 'Collation',      items: ['Amandes (30g)', 'Pomme'], cal: 246 },
      { name: 'Dîner',          items: ['Saumon (100g)', 'Lentilles cuites (100g)', 'Salade verte'], cal: 324 },
    ],
  },
  {
    day: 'Mardi',
    meals: [
      { name: 'Petit-déjeuner', items: ['Fromage blanc 0% (100g)', 'Pain complet x1', 'Œuf entier x1'], cal: 203 },
      { name: 'Déjeuner',       items: ['Thon en boîte (100g)', 'Pâtes cuites (100g)', 'Tomates'], cal: 247 },
      { name: 'Collation',      items: ['Yaourt grec 0% (100g)'], cal: 59 },
      { name: 'Dîner',          items: ['Blanc de poulet (100g)', 'Légumes rôtis', 'Riz cuit (100g)'], cal: 295 },
    ],
  },
  {
    day: 'Mercredi',
    meals: [
      { name: 'Petit-déjeuner', items: ['Œuf entier x2', 'Pain complet x1', 'Café sans sucre'], cal: 236 },
      { name: 'Déjeuner',       items: ['Lentilles cuites (150g)', 'Riz cuit (80g)', 'Poêlée légumes'], cal: 280 },
      { name: 'Collation',      items: ['Banane', 'Fromage blanc 0%'], cal: 134 },
      { name: 'Dîner',          items: ['Saumon (120g)', 'Haricots verts', 'Pommes vapeur'], cal: 310 },
    ],
  },
];

export function MealPlan() {
  const [dayIdx, setDayIdx] = useState(0);
  const day    = PLAN[dayIdx];
  const total  = day.meals.reduce((s, m) => s + m.cal, 0);

  return (
    <div className="page-content">
      <div className="page-title">Plan alimentaire</div>

      <div className="estimate-box" style={{ marginBottom: 12 }}>
        Adapté à ton profil : 2 500 kcal/jour · 160g protéines · déficit ~400 kcal
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {PLAN.map((d, i) => (
          <button key={i}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 13,
              fontWeight: 500, border: '1px solid var(--border)',
              background: dayIdx === i ? 'var(--green)' : 'none',
              color: dayIdx === i ? '#0a0e0a' : 'var(--text-2)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onClick={() => setDayIdx(i)}>
            {d.day}
          </button>
        ))}
      </div>

      {day.meals.map((m, i) => (
        <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 600, color: 'var(--green)', marginBottom: 6 }}>
            {m.name}
          </div>
          {m.items.map((item, j) => (
            <div key={j} style={{ fontSize: 13, color: 'var(--text-2)', padding: '2px 0' }}>
              <span style={{ color: 'var(--green-dim)' }}>→ </span>{item}
            </div>
          ))}
          <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--amber)', marginTop: 6 }}>
            ~{m.cal} kcal
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'right', fontFamily: 'var(--font-data)', fontSize: 13, color: 'var(--amber)', marginTop: 8 }}>
        Total estimé : <strong>{total}</strong> kcal
      </div>
    </div>
  );
}
