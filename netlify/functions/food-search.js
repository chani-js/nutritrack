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
      page_size:    20,
      json:         1,
    });

    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/search?${params}`,
      { headers: { 'User-Agent': 'NutriTrack/1.0' } }
    );

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

exports.handler = handler;