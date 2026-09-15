# FFJM Trainer — Spécification fonctionnelle (v1)

## Vision

Outil d'entraînement aux épreuves du Championnat des Jeux Mathématiques (FFJM), basé sur les vraies annales officielles de la fédération, à destination d'un groupe restreint (famille, club).

## Utilisateurs

- Groupe restreint et connu (pas de grand public en v1).
- Pas de comptes ni de profils individuels en v1 : chacun utilise l'outil sans authentification, sans historique personnel sauvegardé.

## Contenu

- Source : archives officielles FFJM, au format PDF (sujets + corrigés détaillés, séparés), couvrant de nombreuses catégories d'âge et de nombreuses années/tours — une base volumineuse.
- Métadonnées stockées dès le départ pour chaque exercice :
  - **catégorie d'âge** (CE, CM, C1, C2, L1, L2, GP, ...)
  - **année**
  - **tour / session**
  - **thème** : champ réservé dans le modèle, non exploité en v1 (pas de source fiable pour le déterminer actuellement).
- Le contenu d'un énoncé ou d'une correction n'est pas toujours du texte simple : il peut inclure du calcul, de la géométrie, des tableaux, des schémas. Le modèle de contenu doit supporter du texte enrichi (texte + notation mathématique + figures), pas seulement du texte brut ou une image scannée.

## Modes d'usage

1. **Mode révision**
   - Parcours libre des exercices, filtrable au minimum par catégorie.
   - Affichage direct de l'énoncé et de la correction, sans obligation de saisir une réponse.

2. **Mode entraînement / examen**
   - Un exercice est présenté, l'utilisateur saisit une réponse.
   - Si la réponse attendue est simple et univoque (numérique ou texte exact) → **auto-correction** automatique.
   - Sinon → **auto-évaluation** : la correction est affichée et l'utilisateur indique lui-même s'il avait juste (comme dans un système de type Anki).

## Règles d'affichage (UI)

- **Règle du nombre de solutions** : depuis au moins 2003, chaque épreuve FFJM affiche après la fin de la catégorie CM une consigne du type *"Pour qu'un problème soit complètement résolu, vous devez donner le nombre de ses solutions, et donner la solution s'il n'en a qu'une, ou deux solutions s'il en a plus d'une."* Ce n'est pas une donnée propre à un exercice ou à une année : c'est une règle générale du concours. Elle doit être affichée par l'application elle-même (pas stockée en base) dès que le **tier natif** de l'exercice présenté est strictement supérieur à CM, c'est-à-dire dès que `tier` (voir modèle de données) vaut `C1`, `C2`, `L1/GP` ou `L2/HC` — pas `CE` ni `CM`. Attention à ne pas se baser sur `categories` pour cette règle : en format cumulatif, un exercice de tier CE peut très bien apparaître dans `categories` de toutes les catégories (C1, C2... y ont aussi accès), ce qui déclencherait la consigne à tort.

## Hors scope v1

Explicitement écarté ou reporté à une itération future :

- Chronométrage façon concours réel.
- Suivi de progression / statistiques dans le temps.
- Gestion multi-profils / comptes utilisateurs.
- Génération automatique de nouveaux exercices.
- Filtrage ou exploitation par thème.
- Interface d'administration / import en direct dans l'application (l'import est un pipeline hors-ligne, exécuté en one-shot, pas une fonctionnalité de l'app v1).

## Contraintes

- Aucun coût d'infrastructure toléré à court terme : projet personnel/familial.
- Doit rester simple à utiliser sur ordinateur comme sur mobile (site web responsive, pas d'app native).
