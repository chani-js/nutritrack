import { useState, useRef } from 'react';
import { analyzeFood } from '../lib/anthropic';
import { Spinner } from './ui/index';

const CONFIDENCE_LABEL = { high: '✓ Fiable', medium: '~ Estimé', low: '? Incertain' };
const CONFIDENCE_COLOR = { high: 'var(--green)', medium: 'var(--amber)', low: 'var(--red)' };

/**
 * PhotoAnalyzer
 * Permet à l'utilisateur de prendre/uploader une photo de repas,
 * l'envoie à Claude Vision, et affiche les aliments détectés.
 * onConfirm(items) reçoit les aliments validés.
 */
export function PhotoAnalyzer({ onConfirm, onCancel }) {
  const [image,    setImage]    = useState(null);   // { base64, mediaType, url }
  const [result,   setResult]   = useState(null);   // réponse Claude
  const [selected, setSelected] = useState([]);     // indices cochés
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [meal,     setMeal]     = useState('Déjeuner');
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file?.type.startsWith('image/')) return;
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1024;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      URL.revokeObjectURL(objectUrl);
      setImage({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg', url: dataUrl });
      setResult(null); setError('');
    };
    img.onerror = () => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setImage({ base64: dataUrl.split(',')[1], mediaType: file.type, url: dataUrl });
        setResult(null); setError('');
      };
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    try {
      const res = await analyzeFood(image.base64, image.mediaType);
      setResult(res);
      setSelected(res.items.map((_, i) => i)); // tout coché par défaut
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const toggleItem = (i) =>
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const confirm = () => {
    const today = new Date().toISOString().split('T')[0];
    const items = selected.map(i => {
      const item = result.items[i];
      return {
        food_name: `${item.name} (${item.quantity})`,
        calories:  Math.round(item.calories),
        protein:   Math.round(item.protein  * 10) / 10,
        carbs:     Math.round(item.carbs    * 10) / 10,
        fat:       Math.round(item.fat      * 10) / 10,
        meal,
        date: today,
        source: 'photo',
      };
    });
    onConfirm(items);
  };

  return (
    <div className="photo-analyzer animate-scaleIn">
      {/* ── Header ── */}
      <div className="pa-header">
        <span className="pa-title">📷 Analyser une photo</span>
        <button className="pa-close" onClick={onCancel}>✕</button>
      </div>

      {/* ── Zone de drop / upload ── */}
      {!image && (
        <div className="pa-drop"
          onClick={() => inputRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
          <div className="pa-drop-icon">📸</div>
          <div className="pa-drop-label">Prends une photo ou sélectionne depuis la galerie</div>
          <div className="pa-drop-hint">JPG, PNG · max 5 Mo</div>
          <input ref={inputRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {/* ── Aperçu image ── */}
      {image && !result && (
        <div className="pa-preview">
          <img src={image.url} alt="Repas à analyser" className="pa-img" />
          <div className="pa-actions">
            <button className="pa-btn-secondary" onClick={() => setImage(null)}>Changer</button>
            <button className="pa-btn-primary" onClick={analyze} disabled={loading}>
              {loading ? <><Spinner size={14} /> Analyse en cours...</> : '🔍 Analyser'}
            </button>
          </div>
          {error && <div className="pa-error">{error}</div>}
        </div>
      )}

      {/* ── Résultats ── */}
      {result && (
        <div className="pa-results animate-fadeUp">
          <img src={image.url} alt="Repas analysé" className="pa-img-small" />

          <div className="pa-result-header">
            <span className="pa-result-title">Aliments détectés</span>
            <span className="pa-result-total">{result.total_calories} kcal total</span>
          </div>

          <div className="pa-items">
            {result.items.map((item, i) => (
              <div key={i}
                className={`pa-item ${selected.includes(i) ? 'selected' : ''}`}
                onClick={() => toggleItem(i)}>
                <div className="pa-item-check">{selected.includes(i) ? '✓' : ''}</div>
                <div className="pa-item-body">
                  <div className="pa-item-name">{item.name}</div>
                  <div className="pa-item-qty">{item.quantity}</div>
                </div>
                <div className="pa-item-right">
                  <div className="pa-item-cal">{item.calories} kcal</div>
                  <div className="pa-item-macros">{item.protein}P · {item.carbs}G · {item.fat}L</div>
                  <div className="pa-item-conf" style={{ color: CONFIDENCE_COLOR[item.confidence] }}>
                    {CONFIDENCE_LABEL[item.confidence]}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {result.notes && (
            <div className="pa-note">⚠ {result.notes}</div>
          )}

          <div className="pa-meal-row">
            <label className="pa-meal-label">Ajouter au repas :</label>
            <select className="pa-meal-select" value={meal} onChange={e => setMeal(e.target.value)}>
              {['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="pa-actions">
            <button className="pa-btn-secondary" onClick={() => { setResult(null); setImage(null); }}>
              Recommencer
            </button>
            <button className="pa-btn-primary" onClick={confirm} disabled={selected.length === 0}>
              Ajouter {selected.length > 0 ? `(${selected.length})` : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
