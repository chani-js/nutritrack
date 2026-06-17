/**
 * Analyse une image de repas via Claude Vision.
 * Retourne un tableau d'aliments avec estimation calories/macros.
 *
 * @param {string} base64Image  - image encodée en base64 (sans le préfixe data:...)
 * @param {string} mediaType    - ex: "image/jpeg"
 * @returns {Promise<AnalyzedFood[]>}
 */
export async function analyzeFood(base64Image, mediaType = 'image/jpeg') {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY manquante dans .env');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            apiKey,
      'anthropic-version':    '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type:   'image',
            source: { type: 'base64', media_type: mediaType, data: base64Image },
          },
          {
            type: 'text',
            text: `Tu es un nutritionniste expert. Analyse cette photo de repas et identifie chaque aliment visible.

Pour chaque aliment, estime les quantités (grammes, unités) et donne les valeurs nutritionnelles.
Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après, sans backticks.

Format attendu :
{
  "items": [
    {
      "name": "Blanc de poulet",
      "quantity": "120g",
      "calories": 198,
      "protein": 37.2,
      "carbs": 0,
      "fat": 4.3,
      "confidence": "high"
    }
  ],
  "total_calories": 198,
  "notes": "Estimation visuelle, marge ±15%"
}

confidence peut être : "high" | "medium" | "low"
Sois précis mais honnête sur l'incertitude. Si un aliment est difficile à identifier, dis-le dans notes.`,
          },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erreur API Claude (${res.status})`);
  }

  const data = await res.json();
  const raw  = data.content?.find(b => b.type === 'text')?.text ?? '';

  try {
    return JSON.parse(raw);
  } catch {
    // Tentative de récupération si le modèle a quand même mis des backticks
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  }
}
