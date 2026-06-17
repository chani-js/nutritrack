import { CalRing, Badge, Card, CardLabel, ProgressBar } from '../components/ui/index';

const PROFILE = { weight: 121, target: 2500, proteinGoal: 160 };

export function Dashboard({ foodLogs, activityLogs, weights }) {
  const today       = new Date().toISOString().split('T')[0];
  const todayFood   = foodLogs.filter(l => l.date === today);
  const todayAct    = activityLogs.filter(a => a.date === today);

  const totalCal    = todayFood.reduce((s, l) => s + l.calories, 0);
  const totalProtein = todayFood.reduce((s, l) => s + (l.protein ?? 0), 0);
  const totalCarbs  = todayFood.reduce((s, l) => s + (l.carbs   ?? 0), 0);
  const totalFat    = todayFood.reduce((s, l) => s + (l.fat     ?? 0), 0);
  const burned      = todayAct.reduce((s, a) => s + a.calories_burned, 0);
  const net         = totalCal - burned;
  const remaining   = PROFILE.target - net;
  const latestW     = weights.at(-1)?.weight ?? PROFILE.weight;
  const lost        = PROFILE.weight - latestW;
  const pctLost     = lost / (PROFILE.weight - 100);

  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="page-content">
      <div className="page-title">
        Aujourd'hui
        <Badge>{dateStr}</Badge>
      </div>

      {/* ── Calories ── */}
      <Card>
        <CardLabel>Calories nettes</CardLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CalRing consumed={net} target={PROFILE.target} />
          <div style={{ flex: 1 }}>
            <div className="data-number">{net.toLocaleString('fr-FR')}</div>
            <div className="data-sub">kcal consommées nettes</div>
            <div style={{ marginTop: 8, fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 600,
              color: remaining >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {remaining >= 0 ? `${remaining} kcal restantes` : `${Math.abs(remaining)} kcal au-dessus`}
            </div>
            {burned > 0 && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>🔥 {burned} kcal brûlées</div>}
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[
              { label: 'Protéines', val: Math.round(totalProtein), unit: 'g', color: 'var(--green)' },
              { label: 'Glucides',  val: Math.round(totalCarbs),   unit: 'g', color: 'var(--amber)' },
              { label: 'Lipides',   val: Math.round(totalFat),     unit: 'g', color: 'var(--blue)'  },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-data)', fontSize: 16, fontWeight: 600, color: m.color }}>{m.val}{m.unit}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={totalProtein} max={PROFILE.proteinGoal} />
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
              Protéines : {Math.round(totalProtein)}/{PROFILE.proteinGoal}g objectif
            </div>
          </div>
        </div>
      </Card>

      {/* ── Poids ── */}
      <Card>
        <CardLabel>Poids & progression</CardLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div className="data-number">{latestW}<span style={{ fontSize: 14, color: 'var(--text-3)' }}>kg</span></div>
            <div className="data-sub">Poids actuel</div>
          </div>
          {lost > 0 && (
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-dim)', borderRadius: 'var(--r-md)', padding: '8px 14px' }}>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>-{lost.toFixed(1)}kg</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>depuis le départ</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>
            <span>Objectif : 100 kg</span><span>Départ : {PROFILE.weight} kg</span>
          </div>
          <ProgressBar value={Math.max(lost, 0)} max={PROFILE.weight - 100} />
        </div>
      </Card>

      {/* ── Activité ── */}
      <Card>
        <CardLabel>Activité aujourd'hui</CardLabel>
        {todayAct.length === 0
          ? <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Aucune activité enregistrée</div>
          : todayAct.map((a, i) => (
            <div key={i} className="list-row">
              <div>
                <div className="list-name">{a.activity_name}</div>
                <div className="list-sub">{a.duration_min} min</div>
              </div>
              <div className="list-val">{a.calories_burned} kcal</div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}
