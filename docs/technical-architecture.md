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

## Modèle de données

Un fichier JSON par question (pas par examen) : plus simple à valider unitairement, et cohérent avec le principe « l'état, c'est le répertoire, pas un champ » (voir plus bas). Chaque fichier est auto-suffisant : les informations d'examen (année, phase...) sont dénormalisées dans chaque question plutôt que factorisées dans un fichier parent.

Une figure (schéma, image) est un fichier PNG à part, posé à côté du JSON, référencé par son seul nom de fichier (`imageUrl`) — jamais en base64 dans le JSON (voir la discussion archivée sur ce choix : lisibilité par les outils qui lisent/écrivent ces fichiers, taille, pas de duplication quand une figure sert à la fois dans l'énoncé et la correction).

```ts
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
    statement: string             // chemin relatif au fichier JSON lui-même
    detailedSolutions: string[]   // idem ; peut contenir 2 sources à synthétiser
  }

  id: string
  number: number                  // numéro de la question dans l'examen
  title?: string
  coefficient: number
  coefficientSource: "explicit" | "derived-from-number" | "derived-from-order"
  categories: ("CE" | "CM" | "C1" | "C2" | "L1" | "L2" | "GP" | "HC")[]
  // Les catégories FFJM sont cumulatives (CE fait les questions 1-5, CM 1-8, etc.)
  // — categories liste donc toutes les catégories concernées par CETTE question,
  // déduit des marqueurs "FIN CATÉGORIE X" du PDF source, pas un simple cutoff.

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
  /raw          → PDF sources FFJM (committé)
  /needs-review → questions extraites en attente de revue (local, gitignoré)
  /validated    → questions validées (committé) — source de vérité pour /app
/ingest     → PDF → JSON : extraction de figures, etc. (Node, dépendances propres)
/review     → outil de revue/validation (à construire) : petit serveur local + UI
/shared     → code utilisé par /ingest et /review (ex: shared/validate.mjs)
/docs       → specs (ce document et functional-spec.md)
```

`/data` n'appartient à aucun des outils : `/ingest` y écrit (`needs-review`), `/review` y lit et promeut (`needs-review` → `validated`), `/app` y lit (`validated`) au build.

## Hors scope v1 (rappel technique)

- Pas de base de données, pas d'API, pas de backend.
- Pas d'authentification.
- Pas d'interface d'administration en ligne pour l'import (le pipeline est un outil de développement, pas une fonctionnalité produit).
