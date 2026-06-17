# ⚡ NutriTrack

Suivi nutrition & activité physique avec analyse de repas par IA (Claude Vision).

## Stack

- **React 18** + Vite
- **Supabase** — auth + base de données (gratuit)
- **Claude claude-sonnet-4-6** — analyse photo des repas

## Installation

```bash
git clone <repo>
cd nutritrack
npm install
cp .env.example .env
```

Remplis `.env` avec tes clés (voir ci-dessous).

## Setup Supabase (10 min)

1. Crée un compte sur [supabase.com](https://supabase.com)
2. Nouveau projet → **Settings > API** → copie `Project URL` et `anon public key`
3. **SQL Editor** → colle le contenu de `supabase_schema.sql` → Run
4. **Authentication > Providers** → Email activé par défaut ✓

## Setup Anthropic

1. [console.anthropic.com](https://console.anthropic.com) → API Keys → créer une clé
2. Colle dans `.env` sous `VITE_ANTHROPIC_API_KEY`

> ⚠ La clé Anthropic est exposée côté client dans cette version.
> En production, passe par une Edge Function Supabase ou un proxy backend.

## Lancer en local

```bash
npm run dev
```

## Fonctionnalités

| Onglet    | Description |
|-----------|-------------|
| 🏠 Accueil   | Dashboard calories nettes, macros, progression poids |
| 🍽️ Repas    | Log manuel + **analyse photo par IA** |
| ⚡ Activité | Log marche, vélo, natation… avec calories brûlées |
| ⚖️ Poids    | Historique pesées avec progression |
| 📋 Plan     | Menus types adaptés (2 500 kcal, 160g protéines) |

## Structure

```
src/
├── lib/
│   ├── supabase.js      # client Supabase
│   └── anthropic.js     # wrapper Claude Vision
├── hooks/
│   ├── useAuth.js
│   ├── useFoodLogs.js
│   └── useDataLogs.js   # activity + weight
├── components/
│   ├── ui/index.jsx     # Card, CalRing, Badge, ProgressBar…
│   └── PhotoAnalyzer.jsx
├── pages/
│   ├── AuthPage.jsx
│   ├── Dashboard.jsx
│   ├── FoodLog.jsx
│   └── OtherPages.jsx   # Activity, WeightTracker, MealPlan
├── styles/
│   ├── globals.css
│   └── app.css
└── App.jsx
```

## Installer comme vraie app Android (PWA)

1. Lance l'app dans Chrome sur ton téléphone
2. Appuie sur les **3 points** en haut à droite
3. Sélectionne **"Ajouter à l'écran d'accueil"**
4. Confirme → l'icône NutriTrack apparaît comme une vraie app

L'app fonctionne **hors ligne** (les données se synchronisent quand tu as internet).

## Onglets

| Onglet | Description |
|--------|-------------|
| 🏠 Accueil | Dashboard calories, macros, poids |
| 🍽️ Repas | Log manuel + analyse photo IA |
| ⚡ Activité | Log cardio avec calories brûlées |
| 🏊 Cardio | Plan 4 semaines (vélo, tapis, piscine) |
| ⚖️ Poids | Historique pesées |
