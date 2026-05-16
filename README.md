# FitLog — Health & Fitness Tracker

Open `index.html` in a browser. The app is local-first and stores logs in `localStorage`.

## Features
- Strength training log: exercise, set, reps, weight, unit, optional rest, notes.
- Real browser date/calendar tracking and historical CSV export.
- Plan template import from JSON with fuzzy/case-insensitive exercise matching.
- Extensive built-in gym exercise list plus custom exercise creation on unmatched names.
- Nutrition page using the free Open Food Facts API on demand.
- Food log with simple good/neutral/warning nutritional indicators.
- Healthy meal suggestion heuristics based on the day’s totals.
- Water tracker.
- Browser notifications and 2+ day workout-gap warning.
- No AI/LLM content generation.

## Workout plan JSON format
Ask an LLM or trainer to return only valid JSON:

```json
{
  "planName": "4-Day Strength Template",
  "notes": "Optional notes",
  "days": [
    {
      "day": "Day 1",
      "focus": "Lower strength",
      "exercises": [
        {"name": "Barbell Back Squat", "sets": 5, "reps": "5", "targetWeightKg": 100, "restSeconds": 180, "notes": "Optional"}
      ]
    }
  ]
}
```

Required fields: `days[]` and each exercise `name`. Other fields are optional. Unknown names are imported as custom exercises instead of failing.

## Development
Run tests with:

```bash
npm test
```


## Hosting on GitHub Pages

This repo includes `.github/workflows/pages.yml`. After pushing to GitHub:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Push to `main` or run the workflow manually.
5. Your app will be available at `https://<username>.github.io/<repo>/`.

## Install on phone as an app-like PWA

The app includes a web manifest and service worker.

- Android Chrome: open the GitHub Pages URL → menu `⋮` → **Add to Home screen** / **Install app**.
- iPhone Safari: open the URL → Share → **Add to Home Screen**.

This is the easiest mobile install path because it avoids app-store distribution and APK signing.

## APK option

A native Android APK can be produced by wrapping this web app with Capacitor or a Trusted Web Activity. That requires an Android build environment/signing key or a GitHub Actions workflow. The recommended first step is GitHub Pages + PWA; APK packaging can be added afterward if you still want a downloadable `.apk`.


## Additional apps

- `travel/` — Leipzig Travel Scout, a PWA for budget-aware weekend trip recommendations using Open-Meteo forecasts and DB-compatible connection lookups.
