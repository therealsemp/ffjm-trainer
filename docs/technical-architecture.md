# FFJM Trainer — Architecture technique (v1)

Voir [functional-spec.md](./functional-spec.md) pour le périmètre fonctionnel que cette architecture sert.

## Principe général

Site **100% statique**, sans backend. Toutes les données d'exercices sont produites en amont par un pipeline d'import hors-ligne, embarquées au build, et servies comme fichiers statiques. La correction et l'auto-évaluation se font entièrement côté navigateur.

Ce choix découle directement de la contrainte fonctionnelle « pas de comptes, pas de progression sauvegardée, pas de coût d'infra » : rien dans le périmètre v1 ne nécessite un serveur.

## Hébergement & déploiement

- Dépôt GitHub public.
- Hébergement : **GitHub Pages** (gratuit).
- Déploiement : **GitHub Actions**, build + publish automatique au push sur `main`.
- Le pipeline d'import (voir plus bas) n'est **pas** exécuté à chaque déploiement : c'est un traitement à la demande (déclenché manuellement ou via `workflow_dispatch`), dont le résultat (fichiers validés dans `/data`) est commité dans le repo.

## Frontend

- **React + Vite + TypeScript.**
- Justification : écosystème le plus large et le mieux documenté pour un stack neuf, export statique trivial, large choix de librairies pour le rendu enrichi.
- Rendu des maths : **KaTeX**.
- Figures géométriques : **SVG** inline en priorité ; repli sur image (PNG/JPEG extraite du PDF source) quand la figure est trop complexe pour être vectorisée simplement.
- Responsive : un seul site, adapté à l'écran (pas d'app mobile native, pas de PWA en v1).

## Couche applicative (`/app`)

- **Accès aux données** : au build, un script génère un index de navigation (années/phases/catégories disponibles, listing des questions par édition) à partir de `data/validated/`. Les composants ne lisent jamais directement les fichiers JSON de `data/validated/` : ils passent par un module client de données (ex. `dataClient`) qui expose des fonctions asynchrones (`listEditions()`, `getQuestion(id)`, ...) et va chercher les fichiers nécessaires à la demande (par édition) — même si, aujourd'hui, ce sont de simples fichiers statiques servis par GitHub Pages. Objectif : pouvoir remplacer cette implémentation par un vrai appel API plus tard sans toucher aux composants qui consomment les données.
- **Persistance locale** (profil actif, session d'entraînement en cours, préférence de thème) : passe par une couche d'abstraction de stockage générique (interface `get`/`set`/`remove`), indépendante de la technologie de stockage navigateur choisie derrière (cookie, `localStorage`, etc.). Les composants ne manipulent jamais une API de stockage navigateur directement.
- **Thème** (clair/sombre/système) : voir Story 1.4. Par défaut sur la préférence système (`prefers-color-scheme`), réglable explicitement par l'utilisateur, stocké via la même couche de persistance que le reste.
- **Styling / identité visuelle** : non tranché à ce stade — à traiter dans une discussion dédiée avant d'être implémenté.
- **Routage, parsing markdown/maths** : pas de préférence de librairie à ce stade ; choix laissé à l'implémentation (un routeur React et une combinaison markdown+KaTeX standard conviennent).
- **Pas d'i18n** : le public (FFJM) est exclusivement francophone. Les textes affichés à l'utilisateur sont écrits en dur en français directement dans le code, sans couche de traduction ni sélecteur de langue — à ne pas prévoir, même en vue d'une évolution future. Seul le code (identifiants, commentaires) reste en anglais, comme le reste du projet.
- **Stratégie de tests** :
  - Tests unitaires/composants (ex. Vitest + React Testing Library) pour la logique métier : tirage pondéré par `tier`, règles d'affichage dérivées (consigne "nombre de solutions"), couche de stockage, couche client de données.
  - Tests bout-en-bout (ex. Playwright) sur les parcours clés (création de profil → configuration et déroulement d'une session d'entraînement → consultation d'une édition), exécutés à au moins deux tailles de viewport (mobile ~390px, desktop ~1440px) pour couvrir le responsive sans faire de la comparaison pixel par pixel systématique.

## Modèle de données

Un fichier JSON par question (pas par examen) : plus simple à valider unitairement, et cohérent avec le principe « l'état, c'est le répertoire, pas un champ » (voir plus bas). Chaque fichier est auto-suffisant : les informations d'examen (année, phase...) sont dénormalisées dans chaque question plutôt que factorisées dans un fichier parent.

Une figure (schéma, image) est un fichier PNG à part, posé à côté du JSON, référencé par son seul nom de fichier (`imageUrl`) — jamais en base64 dans le JSON (voir la discussion archivée sur ce choix : lisibilité par les outils qui lisent/écrivent ces fichiers, taille, pas de duplication quand une figure sert à la fois dans l'énoncé et la correction).

```ts
type SourceRef = {
  path: string      // chemin relatif au fichier JSON lui-même
  page: number       // page PDF (1-indexée) où la question commence
  position: { x: number; y: number }   // position estimée sur cette page (en points PDF), pour cadrer le visualiseur
}

type RichContent = {
  // texte + markdown + LaTeX inline (\( ... \)) + références à des figures
  markdown: string
  figures?: {
    id: string
    description?: string
    svg?: string
    imageUrl?: string   // nom de fichier seul, le PNG vit à côté du JSON
  }[]
}

type Question = {
  // Dénormalisé depuis l'examen source (un exercice = un fichier autonome)
  year: number
  champNumber: number | null
  phase: "qf" | "sf" | "fn"
  examTitle?: string
  sourceFiles: {
    statement: SourceRef
    detailedSolutions: SourceRef[]   // peut contenir 2 sources à synthétiser
  }
  // `page`/`position` servent à l'outil de revue (cadrer le PDF sur la bonne
  // question) — expérimental (fiabilité du positionnement pas garantie selon
  // le navigateur), et volontairement dans `sourceFiles` : rien ne garantit
  // que ces champs remontent jusqu'au modèle consommé par /app plus tard, à
  // rediscuter à ce moment-là.

  id: string
  number: number                  // numéro de la question dans l'examen
  title?: string
  coefficient: number
  coefficientSource: "explicit" | "derived-from-number" | "derived-from-order"
  categories: ("CE" | "CM" | "C1" | "C2" | "L1" | "L2" | "GP" | "HC")[]
  // Toutes les catégories ayant accès à CETTE question, déduit du PDF source
  // (marqueurs "FIN CATÉGORIE X", table explicite, etc. — la structure varie
  // selon les années, voir ingest/TRANSCRIPTION-GUIDE.md). Toujours trié dans
  // l'ordre canonique CE < CM < C1 < C2 < L1 < GP < L2 < HC (shared/categories.mjs).

  tier: "CE" | "CM" | "C1" | "C2" | "L1/GP" | "L2/HC"
  // Catégorie "native" de la question — dérivée de categories (son entrée de
  // rang le plus bas), pas saisie à la main. Pratique pour un affichage ou un
  // filtre simple ("les questions de niveau CM"), mais ne remplace pas
  // categories : sur un examen à démarrage échelonné par catégorie, une
  // catégorie peut avoir accès à une question sans que ce soit son tier.

  statement: RichContent
  answer: {
    type: "exact-numeric" | "exact-text" | "open"
    value?: string | number   // absent seulement si type = "open"
  }
  correction: RichContent
}
```

Pas de champ `status`/`confidence` dans le JSON : l'état de validation est porté par l'emplacement du fichier (voir plus bas), pas par une donnée qu'on pourrait oublier de mettre à jour.

Règle d'affichage dérivée du modèle, pas stockée dedans : la consigne FFJM sur le nombre de solutions à donner (présente sur toutes les épreuves depuis au moins 2003) doit être affichée par l'app dès qu'une question a une catégorie strictement supérieure à CM — voir `functional-spec.md`.

## Pipeline d'import (le composant le plus complexe du projet)

Objectif : transformer les PDF d'annales FFJM (sujets + corrigés séparés) en questions structurées conformes au modèle ci-dessus.

Approche hybride, itérative :

1. **Extraction assistée par IA** (`/ingest`) : lecture directe des PDF (texte, mise en page, figures) et transcription vers le modèle `Question` — un fichier JSON par question, écrit dans `data/needs-review/`. Les figures/schémas sont extraits en PNG à partir du rendu réel du PDF (`pdfjs-dist` + `@napi-rs/canvas`, coordonnées de recadrage repérées visuellement), pas reconstruits à la main — plus fiable qu'une reconstruction SVG approximative. Quand une phase a plusieurs solutions détaillées sources, elles sont toutes lues et synthétisées en une seule correction (la plus claire/complète) ; un désaccord réel entre sources est signalé explicitement plutôt que résolu silencieusement.
2. **Revue humaine** (outil à venir dans `/review`) : comparaison du JSON rendu (texte + maths + figures) au PDF source, correction si besoin, puis déplacement du fichier vers `data/validated/`.
3. **État = emplacement du fichier**, pas un champ : `data/needs-review/` (local, non commité) → `data/validated/` (source de vérité, commitée). Pas de registre séparé « PDF déjà traités » à maintenir : ça se calcule à la demande en comparant `data/raw/` à `data/validated/`.
4. **Boucle d'amélioration** : les corrections faites pendant la revue humaine servent de référence pour améliorer la qualité des lots d'extraction suivants.

## Structure du dépôt

```
/app        → site React/Vite (le produit déployé), lit data/validated/ au build
/data
  /raw          → PDF sources FFJM (committé), rangés {année}/{phase}/
  /needs-review → questions extraites en attente de revue (local, gitignoré), rangées {année}/{phase}/qNN.json
  /validated    → questions validées (committé) — source de vérité pour /app, même rangement {année}/{phase}/qNN.json
/ingest     → PDF → JSON : extraction de figures, etc. (Node, dépendances propres)
/review     → outil de revue/validation : petit serveur local + UI
/shared     → code utilisé par /ingest et /review (ex: shared/validate.mjs)
/docs       → specs (ce document et functional-spec.md)
```

Les trois zones de `/data` partagent la même arborescence `{année}/{phase}/` — pensé pour l'échelle visée (~20 ans × 3 phases × ~18-27 questions ≈ plus d'un millier de fichiers à terme, ingérable à plat dans un seul répertoire). Dans `raw/`, les noms de fichiers restent complets et auto-descriptifs (`2026_qf_statement.pdf`) car ce sont des sources qui peuvent être déplacées/partagées hors contexte. Dans `needs-review/`/`validated/`, les noms sont courts (`q01.json`, `q01_fig-grid.png`) car le chemin porte déjà l'année et la phase — pas besoin de répéter ce préfixe sur des fichiers dérivés qui ne vivent jamais en dehors de leur dossier.

`/data` n'appartient à aucun des outils : `/ingest` y écrit (`needs-review`), `/review` y lit et promeut (`needs-review` → `validated`), `/app` y lit (`validated`) au build.

## Hors scope v1 (rappel technique)

- Pas de base de données, pas d'API, pas de backend.
- Pas d'authentification.
- Pas d'interface d'administration en ligne pour l'import (le pipeline est un outil de développement, pas une fonctionnalité produit).
