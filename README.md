# FFJM Trainer

Un outil d'entraînement aux épreuves du Championnat des Jeux Mathématiques (FFJM), basé sur les vraies annales officielles, pour un usage familial/personnel.

Voir [`docs/functional-spec.md`](docs/functional-spec.md) (périmètre fonctionnel) et [`docs/technical-architecture.md`](docs/technical-architecture.md) (choix techniques) pour le contexte complet.

## État du projet

En cours de construction, dans cet ordre volontaire :

1. **Pipeline d'ingestion des PDF** (en cours) — transformer les annales FFJM en données structurées.
2. **Outil de revue/validation** (premier jet disponible) — relire et valider ces données avant qu'elles n'alimentent l'application.
3. **Application web** (pas commencée) — ne démarre qu'une fois un modèle de données validé disponible.

## Structure du dépôt

```
/data
  /raw          PDF sources FFJM, par année (committé)
  /needs-review questions extraites, en attente de revue humaine (local, non commité)
  /validated    questions validées, une par fichier JSON (committé) — source de vérité
/ingest         conversion PDF → JSON (Node, dépendances propres à cet outil)
/review         outil de revue/validation : petit serveur local + UI
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

## Revue manuelle des données (`/review`)

Une fois des questions extraites dans `data/needs-review/`, elles doivent être relues à la main avant de rejoindre `data/validated/` — le pipeline d'ingestion (assisté par IA) peut se tromper, notamment sur les figures et les maths.

L'outil de revue est une petite application web locale (serveur + UI, dépendance `express` uniquement) qui affiche la question rendue (énoncé, réponse attendue, correction, avec maths et figures) à côté du PDF source, avec des onglets pour basculer entre l'énoncé et la ou les solutions détaillées. Un bouton **Valider** rejoue la validation du schéma et, si elle passe, déplace la question (JSON + figures PNG) vers `data/validated/`.

Démarrer l'outil :

```bash
cd review
npm install
npm start
```

Puis ouvrir **http://localhost:5175** dans un navigateur. Le port peut être changé : `node server.mjs <port>`.

C'est un outil de développement, pas une fonctionnalité de l'application finale — il ne tourne que sur la machine de la personne qui fait la revue.

## Valider une question en ligne de commande

```bash
node shared/validate.mjs data/needs-review/*.json
```

Vérifie la structure du JSON, la présence des catégories/coefficients, et que chaque figure/PDF source référencé (`imageUrl`, `sourceFiles`) existe bien à l'emplacement relatif indiqué. C'est la même validation que celle utilisée par le bouton "Valider" de l'outil de revue — utile pour vérifier plusieurs fichiers d'un coup sans passer par l'interface.

## Licence des données

Les PDF dans `/data/raw` et le contenu qui en est dérivé sont la propriété de la FFJM. Usage strictement privé/familial pour l'instant ; toute publication plus large nécessiterait une autorisation préalable de la fédération.
