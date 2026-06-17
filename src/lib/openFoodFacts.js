/**
 * Recherche d'aliments via Open Food Facts API
 * Gratuit, pas de clé requise, base FR en priorité
 * Requête via Netlify Function /api/food-search (pas de CORS)
 */

const normalize = s => s.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9 ]/g, '');

export async function searchFoods(query) {
  if (!query || query.length < 2) return [];

  const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`food-search ${res.status}`);

  const data = await res.json();

  const queryNorm  = normalize(query);
  const queryWords = queryNorm.split(' ').filter(w => w.length > 1);

  return (data.products || [])
    .filter(p => {
      const n    = p.nutriments;
      const name = normalize(p.product_name_fr || p.product_name || '');
      // Au moins un mot de la recherche doit être dans le nom du produit
      return name && queryWords.some(w => name.includes(w)) && n?.['energy-kcal_100g'] > 0;
    })
    .map(p => {
      const n     = p.nutriments;
      const name  = (p.product_name_fr || p.product_name || '').trim();
      const brand = p.brands ? ` · ${p.brands.split(',')[0].trim()}` : '';
      return {
        name:    name + brand,
        cal:     Math.round(n['energy-kcal_100g']   ?? 0),
        protein: Math.round((n['proteins_100g']      ?? 0) * 10) / 10,
        carbs:   Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
        fat:     Math.round((n['fat_100g']           ?? 0) * 10) / 10,
      };
    })
    .filter(p => p.cal > 0 && p.name)
    .slice(0, 12);
}
