import { useState, useEffect, useRef } from 'react';
import { Card, CardLabel, Badge, EmptyState, Spinner } from '../components/ui/index';
import { PhotoAnalyzer } from '../components/PhotoAnalyzer';
import { searchFoods } from '../lib/openFoodFacts';

const MEALS = ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner'];

// Aliments de base toujours dispo hors ligne
const FALLBACK = [
  { name: 'Blanc de poulet (100g)', cal: 165, protein: 31,  carbs: 0,   fat: 3.6 },
  { name: 'Œuf entier',             cal: 78,  protein: 6,   carbs: 0.6, fat: 5   },
  { name: 'Riz cuit (100g)',        cal: 130, protein: 2.7, carbs: 28,  fat: 0.3 },
  { name: 'Pain complet (tranche)', cal: 80,  protein: 3.5, carbs: 15,  fat: 1   },
  { name: 'Yaourt grec 0%  (100g)', cal: 59,  protein: 10,  carbs: 3.6, fat: 0.4 },
  { name: 'Fromage blanc 0% (100g)',cal: 45,  protein: 8,   carbs: 4,   fat: 0.2 },
  { name: 'Thon en boîte (100g)',   cal: 116, protein: 25,  carbs: 0,   fat: 1   },
  { name: 'Pâtes cuites (100g)',    cal: 131, protein: 5,   carbs: 25,  fat: 1.1 },
  { name: 'Pomme',                  cal: 72,  protein: 0.4, carbs: 19,  fat: 0.2 },
  { name: 'Banane',                 cal: 89,  protein: 1.1, carbs: 23,  fat: 0.3 },
  { name: 'Lentilles cuites (100g)',cal: 116, protein: 9,   carbs: 20,  fat: 0.4 },
  { name: 'Saumon (100g)',          cal: 208, protein: 20,  carbs: 0,   fat: 13  },
  { name: 'Amandes (30g)',          cal: 174, protein: 6,   carbs: 6,   fat: 15  },
  { name: 'Lait demi-écrémé (200ml)',cal:92,  protein: 6.4, carbs: 9.4, fat: 3.2 },
];

export function FoodLog({ logs, onAdd, onAddMany, onDelete }) {
  const [search,     setSearch]     = useState('');
  const [results,    setResults]    = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [qty,        setQty]        = useState(100);
  const [meal,       setMeal]       = useState('Déjeuner');
  const [showPhoto,  setShowPhoto]  = useState(false);
  const [searching,  setSearching]  = useState(false);
  const [searchErr,  setSearchErr]  = useState('');
  const debounceRef = useRef(null);

  const today     = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === today);
  const totalCal  = todayLogs.reduce((s, l) => s + l.calories, 0);

  // Recherche avec debounce 500ms
  useEffect(() => {
    if (!search || search.length < 2) {
      setResults(search.length === 0 ? [] : FALLBACK.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
      ));
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setSearchErr('');
      try {
        const res = await searchFoods(search);
        setResults(res.length > 0 ? res : FALLBACK.filter(f =>
          f.name.toLowerCase().includes(search.toLowerCase())
        ));
      } catch {
        setSearchErr('Hors ligne — résultats locaux');
        setResults(FALLBACK.filter(f =>
          f.name.toLowerCase().includes(search.toLowerCase())
        ));
      }
      setSearching(false);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const selectFood = (f) => {
    setSelected(f);
    setSearch(f.name);
    setQty(100);
    setResults([]);
  };

  const calcNutrients = () => {
    if (!selected) return null;
    const ratio = qty / 100;
    return {
      cal:     Math.round(selected.cal     * ratio),
      protein: Math.round(selected.protein * ratio * 10) / 10,
      carbs:   Math.round(selected.carbs   * ratio * 10) / 10,
      fat:     Math.round(selected.fat     * ratio * 10) / 10,
    };
  };

  const addManual = () => {
    const n = calcNutrients();
    if (!selected || !n) return;
    onAdd({
      food_name: `${selected.name} (${qty}g)`,
      calories:  n.cal,
      protein:   n.protein,
      carbs:     n.carbs,
      fat:       n.fat,
      meal,
      date: today,
      source: 'manual',
    });
    setSelected(null); setQty(100); setSearch(''); setResults([]);
  };

  const handlePhotoConfirm = async (items) => {
    await onAddMany(items);
    setShowPhoto(false);
  };

  const nutrients = calcNutrients();

  return (
    <div className="page-content">
      {showPhoto && (
        <div className="overlay">
          <PhotoAnalyzer onConfirm={handlePhotoConfirm} onCancel={() => setShowPhoto(false)} />
        </div>
      )}

      <div className="page-title">Repas <Badge color="amber">{totalCal} kcal</Badge></div>

      {/* CTA Photo */}
      <button className="photo-cta" onClick={() => setShowPhoto(true)}>
        <span className="photo-cta-icon">📷</span>
        <div>
          <div className="photo-cta-title">Analyser une photo</div>
          <div className="photo-cta-sub">Claude identifie les aliments automatiquement</div>
        </div>
        <span className="photo-cta-arrow">›</span>
      </button>

      {/* Recherche Open Food Facts */}
      <Card>
        <CardLabel>Rechercher un aliment</CardLabel>

        <div style={{ position: 'relative' }}>
          <input className="field-input" placeholder="Ex: poulet, riz, danette..." value={search}
            onChange={e => { setSearch(e.target.value); setSelected(null); }} />
          {searching && (
            <div style={{ position: 'absolute', right: 10, top: 10 }}>
              <Spinner size={16} />
            </div>
          )}
        </div>

        {searchErr && (
          <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4 }}>⚠ {searchErr}</div>
        )}

        {/* Dropdown résultats */}
        {results.length > 0 && !selected && (
          <div className="search-dropdown" style={{ marginTop: 4 }}>
            {results.map((f, i) => (
              <div key={i} className="search-item" onClick={() => selectFood(f)}>
                <div>
                  <div style={{ fontSize: 13 }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>
                    {f.protein}g P · {f.carbs}g G · {f.fat}g L — pour 100g
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--amber)', flexShrink: 0 }}>
                  {f.cal} kcal
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quantité + repas */}
        {selected && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <div>
                <label className="field-label">Quantité (g)</label>
                <input className="field-input" type="number" min="1" step="10" value={qty}
                  onChange={e => setQty(parseFloat(e.target.value) || 100)} />
              </div>
              <div>
                <label className="field-label">Repas</label>
                <select className="field-select" value={meal} onChange={e => setMeal(e.target.value)}>
                  {MEALS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            {nutrients && (
              <div className="estimate-box" style={{ marginTop: 8 }}>
                → {nutrients.cal} kcal · {nutrients.protein}g P · {nutrients.carbs}g G · {nutrients.fat}g L
              </div>
            )}
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={addManual}>
              Ajouter au journal
            </button>
          </>
        )}

        {!search && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.5 }}>
            Tape au moins 2 lettres pour chercher parmi des millions d'aliments (Open Food Facts 🌍)
          </div>
        )}
      </Card>

      {/* Journal du jour */}
      <Card>
        <CardLabel>Journal du jour</CardLabel>
        {todayLogs.length === 0
          ? <EmptyState icon="🍽️" label="Aucun aliment enregistré" />
          : MEALS.map(m => {
            const items = todayLogs.filter(l => l.meal === m);
            if (!items.length) return null;
            return (
              <div key={m} style={{ marginBottom: 12 }}>
                <div className="meal-section-label">{m}</div>
                {items.map((l, i) => (
                  <div key={i} className="list-row">
                    <div>
                      <div className="list-name">
                        {l.food_name}
                        {l.source === 'photo' && <span className="source-badge">📷</span>}
                      </div>
                      <div className="list-sub">{l.protein}g P · {l.carbs}g G · {l.fat}g L</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>
                        {l.calories} kcal
                      </span>
                      <button className="btn-icon-del" onClick={() => onDelete(l.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        }
      </Card>
    </div>
  );
}
