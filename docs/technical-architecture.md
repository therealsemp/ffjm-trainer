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

Fichiers JSON générés par le pipeline, consommés au build du site.

```ts
type RichContent = {
  // texte + markdown + LaTeX inline (\( ... \)) + références à des figures
  markdown: string
  figures?: { id: string; svg?: string; imageUrl?: string }[]
}

type Exercise = {
  id: string
  category: "CE" | "CM" | "C1" | "C2" | "L1" | "L2" | "GP" | ...
  year: number
  round: string          // tour / session
  theme?: string          // réservé, non exploité en v1

  statement: RichContent
  answer: {
    type: "exact-numeric" | "exact-text" | "open"
    value?: string | number   // absent si type = "open"
  }
  correction: RichContent

  status: "draft" | "needs-review" | "validated"
  confidence?: number     // score du pipeline d'extraction, pour prioriser la revue
}
```

## Pipeline d'import (le composant le plus complexe du projet)

Objectif : transformer les PDF d'annales FFJM (sujets + corrigés séparés) en exercices structurés conformes au modèle ci-dessus.

Approche hybride, itérative :

1. **Extraction automatisée assistée par IA** : lecture des pages de PDF (texte + mise en page + figures) et transcription directe vers `RichContent` structuré, avec un **score de confiance** par exercice extrait.
2. **File de revue humaine**, priorisée par confiance croissante (les cas les moins fiables en premier) : relecture et correction manuelle, changement de `status` vers `validated`.
3. **Boucle d'amélioration** : les corrections manuelles servent de référence (exemples, ajustements de prompt) pour améliorer la qualité des lots d'extraction suivants.
4. Le pipeline vit dans `/pipeline`, complètement séparé du site déployé. Son output validé (fichiers `/data/*.json`) est ce que le site consomme — pas les PDF sources ni les scripts d'extraction.

## Structure du dépôt

```
/app        → site React/Vite (le produit déployé)
/data       → exercices validés (JSON), source de vérité consommée par /app au build
/pipeline   → scripts d'extraction/transcription + outillage de revue, exécutés hors-ligne
/docs       → specs (ce document et functional-spec.md)
```

## Hors scope v1 (rappel technique)

- Pas de base de données, pas d'API, pas de backend.
- Pas d'authentification.
- Pas d'interface d'administration en ligne pour l'import (le pipeline est un outil de développement, pas une fonctionnalité produit).
