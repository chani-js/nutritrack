/**
 * Recherche via Netlify Function /api/food-search
 * Le filtre et la normalisation sont faits côté serveur
 */

export async function searchFoods(query) {
  if (!query || query.length < 2) return [];

  const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`food-search ${res.status}`);

  const data = await res.json();
  return data.products || [];
}