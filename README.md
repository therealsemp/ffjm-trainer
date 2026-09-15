# FFJM Trainer

Un outil d'entraînement aux épreuves du Championnat des Jeux Mathématiques (FFJM), basé sur les vraies annales officielles, pour un usage familial/personnel.

Voir [`docs/functional-spec.md`](docs/functional-spec.md) (périmètre fonctionnel) et [`docs/technical-architecture.md`](docs/technical-architecture.md) (choix techniques) pour le contexte complet.

## État du projet

En cours de construction, dans cet ordre volontaire :

1. **Pipeline d'ingestion des PDF** (en cours) — transformer les annales FFJM en données structurées.
2. **Outil de revue/validation** (à venir) — relire et valider ces données avant qu'elles n'alimentent l'application.
3. **Application web** (pas commencée) — ne démarre qu'une fois un modèle de données validé disponible.

## Structure du dépôt

```
/data
  /raw          PDF sources FFJM, par année (committé)
  /needs-review questions extraites, en attente de revue humaine (local, non commité)
  /validated    questions validées, une par fichier JSON (committé) — source de vérité
/ingest         conversion PDF → JSON (Node, dépendances propres à cet outil)
/review         outil de revue/validation : petit serveur local + UI (pas encore construit)
/shared         code utilisé à la fois par /ingest et /review (ex: validate.mjs)
/app            site statique déployé (pas encore construit)
/docs           spécifications fonctionnelle et technique
```

`/data` n'appartient à aucun outil en particulier : `/ingest` y écrit (`needs-review`), l'outil de revue y lit et promeut les fichiers (`needs-review` → `validated`), `/app` y lira (`validated`) au moment du build. L'état d'une question, c'est le répertoire dans lequel elle se trouve — pas un champ dans son JSON.

## Pipeline d'ingestion (`/ingest`)

```bash
cd ingest
npm install
node render-page.mjs <pdf> <page> <scale> <out.png>       # rendre une page en image, pour repérer une figure
node crop-figure.mjs <pdf> <page> <x> <y> <w> <h> <out.png> # extraire une figure précise en PNG
```

La transcription du texte/maths des PDF vers le JSON structuré se fait avec l'assistance d'un modèle capable de lire les PDF directement (voir `docs/technical-architecture.md`), pas par un script one-shot.

## Valider une question

```bash
node shared/validate.mjs data/needs-review/*.json
```

Vérifie la structure du JSON, la présence des catégories/coefficients, et que chaque figure/PDF source référencé (`imageUrl`, `sourceFiles`) existe bien à l'emplacement relatif indiqué.

## Licence des données

Les PDF dans `/data/raw` et le contenu qui en est dérivé sont la propriété de la FFJM. Usage strictement privé/familial pour l'instant ; toute publication plus large nécessiterait une autorisation préalable de la fédération.
