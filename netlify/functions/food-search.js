const handler = async (event) => {
  const query = event.queryStringParameters?.q || '';

  if (!query || query.length < 2) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ products: [] }),
    };
  }

  try {
    const params = new URLSearchParams({
      search_terms: query,
      fields:       'product_name,product_name_fr,brands,nutriments',
      page_size:    50,
      json:         1,
      lc:           'fr',
      countries_tags: 'france',
    });

    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/search?${params}`,
      { headers: { 'User-Agent': 'NutriTrack/1.0' } }
    );

    const data = await res.json();

    // Normalise accents
    const normalize = s => (s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, '');

    const queryNorm  = normalize(query);
    const queryWords = queryNorm.split(' ').filter(w => w.length > 1);

    const filtered = (data.products || [])
      .filter(p => {
        const n    = p.nutriments;
        const name = normalize(p.product_name_fr || p.product_name || '');
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ products: filtered }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

exports.handler = handler;