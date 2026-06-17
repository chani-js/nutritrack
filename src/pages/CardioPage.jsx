import { useState } from 'react';

const WEEKS = [
  {
    label: "Mise en route — découverte des machines",
    totalCal: 1800, totalMin: 340, sessions: 6,
    days: [
      { name:"Lundi",    type:"velo",      typeLabel:"Vélo",
        blocks:[["5'","Échauffement","Niveau 1 — pédalage libre",25],["40'","Cardio continu","Niveau 3 — cadence 68-72 RPM stable",240],["5'","Récup","Niveau 1",20]],
        totalMin:50, totalCal:285 },
      { name:"Mardi",    type:"tapis",     typeLabel:"Tapis",
        blocks:[["5'","Échauffement","2,5 km/h",20],["35'","Marche active","4,5 km/h — main sur barre, surface plane",220],["5'","Récup","2,5 km/h",15]],
        totalMin:45, totalCal:255 },
      { name:"Mercredi", type:"rameur",    typeLabel:"Rameur",
        blocks:[["3'","Échauffement","Résistance 2 — prise en main, dos droit, jambes d'abord",15],["5'","Série 1/3","Résistance 3 — cadence 20 coups/min, régulier",40],["1'","Repos","Arrêt complet, respiration",0],["5'","Série 2/3","Résistance 3 — maintenir la cadence",40],["1'","Repos","Boire, souffler",0],["5'","Série 3/3","Résistance 3 — tenir jusqu'au bout",40],["2'","Retour calme","Résistance 1 — allure très lente",10]],
        totalMin:22, totalCal:145 },
      { name:"Jeudi",    type:"repos",     typeLabel:"Repos",     repos:true, reposSub:"Repos complet ou marche légère 15 min." },
      { name:"Vendredi", type:"combo",     typeLabel:"Vélo + Tapis",
        blocks:[["25'","Vélo niv 3-4","3' niv 4 / 2' niv 2 — 5 cycles",190],["5'","Transition","Vérifier glycémie",0],["20'","Tapis marche","4,5 km/h",130]],
        totalMin:50, totalCal:320 },
      { name:"Samedi",   type:"elliptique",typeLabel:"Elliptique",
        blocks:[["5'","Échauffement","Résistance 1 — prise en main poignées",25],["30'","Cardio elliptique","Résistance 4 — mouvement fluide bras + jambes",195],["5'","Récup","Résistance 1",20]],
        totalMin:40, totalCal:240 },
      { name:"Dimanche", type:"tapis",     typeLabel:"Tapis",
        blocks:[["5'","Échauffement","2,5 km/h",20],["40'","Marche longue","4 km/h — récup active",240],["5'","Retour calme","2 km/h",15]],
        totalMin:50, totalCal:275 },
    ]
  },
  {
    label: "Montée en charge +15%",
    totalCal: 2050, totalMin: 375, sessions: 6,
    days: [
      { name:"Lundi",    type:"velo",      typeLabel:"Vélo",
        blocks:[["5'","Échauffement","Niveau 2",30],["45'","Endurance niv 4","Cadence 72 — montée niv 4 sur 15 dernières min",315],["5'","Récup","Niveau 1",20]],
        totalMin:55, totalCal:365 },
      { name:"Mardi",    type:"tapis",     typeLabel:"Tapis",
        blocks:[["5'","Échauffement","2,5 km/h",20],["40'","Marche active","5 km/h — inclinaison 1% si équilibre stable",270],["5'","Récup","2,5 km/h",15]],
        totalMin:50, totalCal:305 },
      { name:"Mercredi", type:"rameur",    typeLabel:"Rameur",
        blocks:[["3'","Échauffement","Résistance 2",15],["5'","Série 1/4","Résistance 4 — cadence 22 coups/min",42],["1'","Repos","Respiration",0],["5'","Série 2/4","Résistance 4",42],["1'","Repos","Boire",0],["5'","Série 3/4","Résistance 4",42],["1'","Repos","Souffler",0],["5'","Série 4/4","Résistance 4 — dernière, tiens bon",42],["2'","Retour calme","Résistance 1",10]],
        totalMin:28, totalCal:193 },
      { name:"Jeudi",    type:"repos",     typeLabel:"Repos actif", repos:true, reposSub:"Marche 20 min ou repos. Récup après le fractionné rameur." },
      { name:"Vendredi", type:"combo",     typeLabel:"Vélo + Rameur",
        blocks:[["30'","Vélo HIIT doux","1' niv 5 / 2' niv 2 — 10 cycles",245],["5'","Transition","Glycémie obligatoire",0],["20'","Rameur continu","Résistance 4 — cadence 20-22 coups/min",155]],
        totalMin:55, totalCal:400 },
      { name:"Samedi",   type:"elliptique",typeLabel:"Elliptique",
        blocks:[["5'","Échauffement","Résistance 2",30],["35'","Cardio elliptique","Résistance 5 — accélération 1 min toutes les 5 min",245],["5'","Récup","Résistance 1",20]],
        totalMin:45, totalCal:295 },
      { name:"Dimanche", type:"tapis",     typeLabel:"Tapis",
        blocks:[["5'","Échauffement","2,5 km/h",20],["45'","Marche longue","4-4,5 km/h",260]],
        totalMin:50, totalCal:280 },
    ]
  },
  {
    label: "Intensification — fractionné",
    totalCal: 2300, totalMin: 410, sessions: 6,
    days: [
      { name:"Lundi",    type:"velo",      typeLabel:"Vélo",
        blocks:[["5'","Échauffement","Niveau 2",35],["50'","Endurance niv 4","Cadence 74 RPM — effort soutenu continu",385],["5'","Récup","Niveau 1",20]],
        totalMin:60, totalCal:440 },
      { name:"Mardi",    type:"rameur",    typeLabel:"Rameur",
        blocks:[["3'","Échauffement","Résistance 2",15],["5'","Série 1/3","Résistance 4 — cadence 22",42],["1'","Repos","Souffler",0],["7'","Série 2/3","Résistance 4 — tenir le rythme",60],["1'","Repos","Boire",0],["5'","Série 3/3","Résistance 5 — effort final",48],["2'","Retour calme","Résistance 1",10]],
        totalMin:24, totalCal:175 },
      { name:"Mercredi", type:"elliptique",typeLabel:"Elliptique",
        blocks:[["5'","Échauffement","Résistance 2",30],["40'","HIIT elliptique","1' résistance 7 / 2' résistance 3 — 13 cycles",295],["5'","Récup","Résistance 1",20]],
        totalMin:50, totalCal:345 },
      { name:"Jeudi",    type:"repos",     typeLabel:"Repos",     repos:true, reposSub:"Repos complet. Semaine chargée — non négociable." },
      { name:"Vendredi", type:"combo",     typeLabel:"Vélo + Tapis",
        blocks:[["35'","Vélo HIIT modéré","1'30 niv 5 / 2' niv 2 — 8 cycles",300],["5'","Transition","Glycémie obligatoire",0],["30'","Tapis marche","5 km/h",195]],
        totalMin:70, totalCal:495 },
      { name:"Samedi",   type:"rameur",    typeLabel:"Rameur",
        blocks:[["3'","Échauffement","Résistance 2",15],["8'","Série 1/2","Résistance 4 — rythme conversation",65],["2'","Repos","Respiration, boire",0],["8'","Série 2/2","Résistance 4 — maintenir le rythme",65],["2'","Retour calme","Résistance 1",10]],
        totalMin:23, totalCal:155 },
      { name:"Dimanche", type:"tapis",     typeLabel:"Tapis",
        blocks:[["5'","Échauffement","2,5 km/h",20],["50'","Marche longue","4 km/h — récup active",280]],
        totalMin:55, totalCal:300 },
    ]
  },
  {
    label: "Pic + bilan mensuel",
    totalCal: 2550, totalMin: 445, sessions: 6,
    days: [
      { name:"Lundi",    type:"velo",      typeLabel:"Vélo",
        blocks:[["5'","Échauffement","Niveau 2",35],["55'","Endurance niv 5","Cadence 75 RPM — pic de la semaine",440],["5'","Récup","Niveau 1",20]],
        totalMin:65, totalCal:495 },
      { name:"Mardi",    type:"rameur",    typeLabel:"Rameur",
        blocks:[["3'","Échauffement","Résistance 2",15],["10'","Série 1/2","Résistance 5 — cadence 22-24, dos droit",85],["2'","Repos","Boire, respirer",0],["10'","Série 2/2","Résistance 5 — tenir la même cadence",85],["2'","Retour calme","Résistance 1",10]],
        totalMin:27, totalCal:195 },
      { name:"Mercredi", type:"elliptique",typeLabel:"Elliptique",
        blocks:[["5'","Échauffement","Résistance 2",30],["45'","Séance longue","Résistance 6 — effort continu bras + jambes coordonnés",340],["5'","Récup","Résistance 1",20]],
        totalMin:55, totalCal:390 },
      { name:"Jeudi",    type:"repos",     typeLabel:"Repos",     repos:true, reposSub:"Repos complet. Peser le matin à jeun — bilan du mois." },
      { name:"Vendredi", type:"combo",     typeLabel:"Vélo + Rameur",
        blocks:[["40'","Vélo HIIT long","2' niv 5 / 2' niv 2 — 10 cycles",350],["5'","Transition","Glycémie obligatoire",0],["10'","Rameur série 1/2","Résistance 4 — rythme soutenu",85],["2'","Repos","Souffler",0],["10'","Rameur série 2/2","Résistance 4 — tenir coûte que coûte",85]],
        totalMin:67, totalCal:520 },
      { name:"Samedi",   type:"rameur",    typeLabel:"Rameur",
        blocks:[["3'","Échauffement","Résistance 2",15],["10'","Série 1/2","Résistance 5 — compare avec S1 : tu iras plus loin avec moins d'effort",85],["2'","Repos","Boire",0],["10'","Série 2/2 bilan","Résistance 5 — ton meilleur effort du mois",85],["2'","Retour calme","Résistance 1",10]],
        totalMin:27, totalCal:195 },
      { name:"Dimanche", type:"tapis",     typeLabel:"Tapis",
        blocks:[["5'","Échauffement","2,5 km/h",20],["55'","Marche bilan","4,5 km/h — comparer avec S1",315]],
        totalMin:60, totalCal:335 },
    ]
  },
];

const TYPE_STYLES = {
  velo:       { label:'Vélo',         bg:'var(--green-bg)', color:'var(--green)',   border:'var(--green-dim)' },
  tapis:      { label:'Tapis',        bg:'var(--amber-bg)', color:'var(--amber)',   border:'#78450a'           },
  rameur:     { label:'Rameur',       bg:'#0c1a2e',         color:'#60a5fa',        border:'#1e3a5f'           },
  elliptique: { label:'Elliptique',   bg:'#1a1030',         color:'#a78bfa',        border:'#3b2a6e'           },
  combo:      { label:'Combo',        bg:'var(--red-bg)',   color:'#f87171',        border:'#7f1d1d'           },
  repos:      { label:'Repos',        bg:'var(--surface-2)',color:'var(--text-3)',  border:'var(--border)'     },
};

function TypeBadge({ type }) {
  const s = TYPE_STYLES[type] || TYPE_STYLES.repos;
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`,
      borderRadius:20, fontSize:10, fontWeight:600, padding:'2px 8px', flexShrink:0 }}>
      {s.label}
    </span>
  );
}

export function CardioPage() {
  const [weekIdx, setWeekIdx] = useState(0);
  const week = WEEKS[weekIdx];

  return (
    <div className="page-content">
      <div className="page-title">
        Plan cardio
        <span style={{ background:'var(--green-bg)', color:'var(--green)', border:'1px solid var(--green-dim)',
          borderRadius:20, fontSize:11, fontWeight:600, padding:'2px 9px' }}>
          −1 kg/sem
        </span>
      </div>

      <div style={{ background:'var(--amber-bg)', border:'1px solid #78450a', borderRadius:'var(--r-md)',
        padding:'10px 12px', fontSize:12, color:'var(--amber)', lineHeight:1.6, marginBottom:12 }}>
        ⚠ DT1 — glycémie avant chaque séance. Tapis : main sur barre. Rameur : dos droit, jambes d'abord, ne pas arrondir les lombaires.
      </div>

      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
        {Object.entries(TYPE_STYLES).filter(([k])=>k!=='repos').map(([k,s])=>(
          <span key={k} style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`,
            borderRadius:20, fontSize:10, fontWeight:600, padding:'2px 8px' }}>{s.label}</span>
        ))}
      </div>

      <div style={{ display:'flex', gap:5, marginBottom:12 }}>
        {WEEKS.map((_,i)=>(
          <button key={i} onClick={()=>setWeekIdx(i)} style={{
            flex:1, padding:'7px 3px', borderRadius:'var(--r-md)',
            border:'1px solid var(--border)',
            background: weekIdx===i ? 'var(--green)' : 'none',
            color: weekIdx===i ? '#0a0e0a' : 'var(--text-3)',
            fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s',
          }}>S{i+1}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        <div style={{ background:'var(--surface-2)', borderRadius:'var(--r-md)', padding:'12px 14px' }}>
          <div style={{ fontFamily:'var(--font-data)', fontSize:22, fontWeight:700, color:'var(--green)' }}>
            {week.totalCal.toLocaleString('fr-FR')}
          </div>
          <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>kcal brûlées / semaine</div>
        </div>
        <div style={{ background:'var(--surface-2)', borderRadius:'var(--r-md)', padding:'12px 14px' }}>
          <div style={{ fontFamily:'var(--font-data)', fontSize:22, fontWeight:700, color:'var(--text-1)' }}>
            {week.totalMin} min
          </div>
          <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{week.sessions} séances</div>
        </div>
      </div>

      <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:12, fontStyle:'italic' }}>
        Semaine {weekIdx+1} — {week.label}
      </div>

      {week.days.map((day, i) => {
        if (day.repos) return (
          <div key={i} style={{ background:'var(--surface-2)', borderRadius:'var(--r-lg)', padding:'12px 14px', marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:14, fontWeight:500, color:'var(--text-1)' }}>{day.name}</span>
              <TypeBadge type={day.type} />
            </div>
            <div style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.5 }}>{day.reposSub}</div>
          </div>
        );
        return (
          <div key={i} className="card" style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:14, fontWeight:500, color:'var(--text-1)' }}>{day.name}</span>
              <TypeBadge type={day.type} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {day.blocks.map(([t,n,det,c], j) => (
                <div key={j} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:10, color:'var(--text-3)', minWidth:28, paddingTop:1 }}>{t}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:'var(--text-1)' }}>{n}</div>
                    <div style={{ fontSize:11, color:'var(--text-2)', marginTop:1, lineHeight:1.4 }}>{det}</div>
                  </div>
                  {c > 0 && <span style={{ fontSize:11, fontWeight:600, color:'var(--green)', whiteSpace:'nowrap' }}>~{c}</span>}
                </div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid var(--border)', marginTop:10, paddingTop:8,
              display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)' }}>
              <span>{day.totalMin} min</span>
              <span style={{ fontWeight:600, color:'var(--green)' }}>~{day.totalCal} kcal</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
