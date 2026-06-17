export default async (req) => {
  const url  = new URL(req.url);
  const query = url.searchParams.get('q') || '';

  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ products: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const params = new URLSearchParams({
    search_terms: query,
    fields:       'product_name,product_name_fr,brands,nutriments',
    page_size:    20,
    json:         1,
  });

  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/search?${params}`,
    { headers: { 'User-Agent': 'NutriTrack/1.0' } }
  );

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const config = { path: '/api/food-search' };
