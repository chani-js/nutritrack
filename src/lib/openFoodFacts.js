const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/search';

export async function searchFoods(query) {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    search_terms: query,
    fields:       'product_name,product_name_fr,brands,nutriments',
    page_size:    20,
    json:         1,
  });

  const targetUrl = `${OFF_BASE}?${params}`;
  const proxyUrl  = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Proxy ${res.status}`);

  const wrapper = await res.json();
  const data    = JSON.parse(wrapper.contents);

  const queryLower = query.toLowerCase();

  return (data.products || [])
    .filter(p => {
      const n    = p.nutriments;
      const name = (p.product_name_fr || p.product_name || '').toLowerCase();
      return name.includes(queryLower) && n?.['energy-kcal_100g'] > 0;
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