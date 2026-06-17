import { useState, useMemo } from 'react';
import { Card, CardLabel } from '../components/ui/index';

const MEALS = ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner'];
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

// ─── Mini graphique SVG ───────────────────────────────────────────
function CalChart({ logs, days, target }) {
  const data = days.map(d => {
    const dayLogs = logs.filter(l => l.date === d);
    return dayLogs.reduce((s, l) => s + l.calories, 0);
  });
  const max = Math.max(...data, target, 500);
  const W = 280, H = 80, pad = 10;
  const barW = (W - pad * 2) / days.length - 3;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} style={{ overflow: 'visible' }}>
      {/* Ligne objectif */}
      <line
        x1={pad} y1={H - (target / max) * (H - pad)}
        x2={W - pad} y2={H - (target / max) * (H - pad)}
        stroke="var(--amber)" strokeWidth="1" strokeDasharray="4 3" opacity="0.6"
      />
      {data.map((cal, i) => {
        const x   = pad + i * ((W - pad * 2) / days.length);
        const pct = cal / max;
        const bh  = Math.max(pct * (H - pad), 2);
        const y   = H - bh;
        const color = cal > target ? 'var(--red)' : cal > target * 0.85 ? 'var(--amber)' : 'var(--green)';
        const label = days[i].slice(8); // jour du mois
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="3" fill={color} opacity="0.85" />
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fill="var(--text-3)" fontSize="8" fontFamily="DM Sans">
              {label}
            </text>
            {cal > 0 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle" fill={color} fontSize="8" fontFamily="Space Grotesk" fontWeight="600">
                {cal > 999 ? `${(cal/1000).toFixed(1)}k` : cal}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Calendrier ──────────────────────────────────────────────────
function Calendar({ selectedDate, onSelect, logs }) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = toISO(new Date());

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  // Lundi = 0
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);

  const calLogs = {};
  logs.forEach(l => {
    if (!calLogs[l.date]) calLogs[l.date] = 0;
    calLogs[l.date] += l.calories;
  });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div>
      {/* Header mois */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: 18, cursor: 'pointer', padding: '0 8px' }}>‹</button>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
          {MONTHS_FR[month]} {year}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: 18, cursor: 'pointer', padding: '0 8px' }}>›</button>
      </div>

      {/* Jours semaine */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS_FR.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-3)', padding: '2px 0', fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      {/* Cases */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso     = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = iso === today;
          const isSel   = iso === selectedDate;
          const hasCal  = calLogs[iso] > 0;

          return (
            <button key={i} onClick={() => onSelect(iso)} style={{
              background: isSel ? 'var(--green)' : isToday ? 'var(--green-bg)' : 'var(--surface-2)',
              border: `1px solid ${isSel ? 'var(--green)' : isToday ? 'var(--green-dim)' : 'var(--border)'}`,
              borderRadius: 6, padding: '5px 2px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: isSel ? '#0a0e0a' : isToday ? 'var(--green)' : 'var(--text-1)' }}>
                {day}
              </span>
              {hasCal && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSel ? '#0a0e0a' : 'var(--green)', opacity: 0.8 }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────
export function HistoryPage({ foodLogs, activityLogs, weights }) {
  const today = toISO(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [chartRange,   setChartRange]   = useState(7);

  // Données du jour sélectionné
  const dayFood = foodLogs.filter(l => l.date === selectedDate);
  const dayAct  = activityLogs.filter(a => a.date === selectedDate);
  const totalCal    = dayFood.reduce((s, l) => s + l.calories, 0);
  const totalBurned = dayAct.reduce((s, a) => s + a.calories_burned, 0);
  const net         = totalCal - totalBurned;
  const protein     = dayFood.reduce((s, l) => s + (l.protein ?? 0), 0);
  const carbs       = dayFood.reduce((s, l) => s + (l.carbs   ?? 0), 0);
  const fat         = dayFood.reduce((s, l) => s + (l.fat     ?? 0), 0);

  // Jours pour le graphique
  const chartDays = useMemo(() => {
    const arr = [];
    for (let i = chartRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(toISO(d));
    }
    return arr;
  }, [chartRange]);

  // Stats globales
  const activeDays  = [...new Set(foodLogs.map(l => l.date))].length;
  const avgCal      = activeDays > 0
    ? Math.round(foodLogs.reduce((s, l) => s + l.calories, 0) / activeDays)
    : 0;
  const latestW     = weights.at(-1)?.weight ?? null;
  const firstW      = weights[0]?.weight ?? null;
  const totalLost   = firstW && latestW ? (firstW - latestW).toFixed(1) : null;

  return (
    <div className="page-content">
      <div className="page-title">Historique</div>

      {/* Stats globales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { val: activeDays,         lbl: 'jours tracés' },
          { val: avgCal ? `${avgCal}` : '—', lbl: 'kcal moy/jour' },
          { val: totalLost ? `-${totalLost}kg` : '—', lbl: 'poids perdu', color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: 16, fontWeight: 700, color: s.color ?? 'var(--text-1)' }}>{s.val}</div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Graphique calories */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <CardLabel>Calories — {chartRange} derniers jours</CardLabel>
          <div style={{ display: 'flex', gap: 4 }}>
            {[7, 14, 30].map(n => (
              <button key={n} onClick={() => setChartRange(n)} style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                border: '1px solid var(--border)',
                background: chartRange === n ? 'var(--green)' : 'none',
                color: chartRange === n ? '#0a0e0a' : 'var(--text-3)',
                cursor: 'pointer',
              }}>{n}j</button>
            ))}
          </div>
        </div>
        <CalChart logs={foodLogs} days={chartDays} target={2500} />
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, color: 'var(--text-3)' }}>
          <span style={{ color: 'var(--amber)' }}>— Objectif 2 500 kcal</span>
          <span style={{ color: 'var(--green)' }}>■ OK</span>
          <span style={{ color: 'var(--amber)' }}>■ Proche</span>
          <span style={{ color: 'var(--red)' }}>■ Dépassé</span>
        </div>
      </Card>

      {/* Calendrier */}
      <Card>
        <CardLabel>Naviguer par jour</CardLabel>
        <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} logs={foodLogs} />
      </Card>

      {/* Détail du jour sélectionné */}
      <Card>
        <CardLabel>
          {selectedDate === today ? "Aujourd'hui" : formatDate(selectedDate)}
        </CardLabel>

        {dayFood.length === 0 && dayAct.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: 'var(--text-3)' }}>
            Aucune donnée ce jour
          </div>
        ) : (
          <>
            {/* Résumé chiffré */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
              <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
                <div style={{ fontFamily: 'var(--font-data)', fontSize: 20, fontWeight: 700, color: net > 2500 ? 'var(--red)' : 'var(--green)' }}>{net}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>kcal nettes</div>
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{Math.round(protein)}g</span>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>{Math.round(carbs)}g</span>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>{Math.round(fat)}g</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>P · G · L</div>
              </div>
            </div>

            {/* Repas */}
            {dayFood.length > 0 && MEALS.map(m => {
              const items = dayFood.filter(l => l.meal === m);
              if (!items.length) return null;
              return (
                <div key={m} style={{ marginBottom: 10 }}>
                  <div className="meal-section-label">{m}</div>
                  {items.map((l, i) => (
                    <div key={i} className="list-row">
                      <div>
                        <div className="list-name">{l.food_name}</div>
                        <div className="list-sub">{l.protein}g P · {l.carbs}g G · {l.fat}g L</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>
                        {l.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Activités */}
            {dayAct.length > 0 && (
              <div>
                <div className="meal-section-label">Activités</div>
                {dayAct.map((a, i) => (
                  <div key={i} className="list-row">
                    <div>
                      <div className="list-name">{a.activity_name}</div>
                      <div className="list-sub">{a.duration_min} min</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
                      -{a.calories_burned} kcal
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
