# User Story 2.2 — Déroulement d'une question

## Epic
EPIC 2 — Réalisation d'exercices (entraînement)

## Acteur
Utilisateur en session d'entraînement active

## User Story
**En tant qu'** utilisateur en session d'entraînement,
**je veux** voir une question tirée au hasard parmi les niveaux sélectionnés, y répondre à mon rythme, puis passer à la suivante,
**afin de** m'entraîner sans pression de temps et m'auto-évaluer honnêtement.

## Contexte / Règles métier
- Le tirage d'une question se fait au hasard parmi les niveaux sélectionnés pour la session, pondéré par le coefficient officiel de chaque niveau (nombre d'énigmes de l'épreuve réelle : CE=5, CM=8, C1=11, C2=14, L1=16, GP=16, L2=18, HC=18), renormalisé sur les seuls niveaux sélectionnés.
- La répétition d'une question déjà vue dans la session est autorisée : chaque tirage se fait sur l'ensemble des questions des niveaux sélectionnés, sans exclusion des questions déjà vues.
- Aucune limite de temps n'est imposée sur une question.
- L'utilisateur peut passer une question à tout moment, y compris après avoir consulté la réponse.

## Critères d'acceptation

### Scénario 1 : Affichage d'une nouvelle question
- **Given** l'utilisateur est en session active avec des niveaux sélectionnés
- **When** une question doit être affichée (démarrage de session ou après une action sur la question précédente)
- **Then** une question est tirée au hasard parmi les niveaux sélectionnés, avec une probabilité proportionnelle au coefficient de chaque niveau
- **And** l'énoncé (texte + image éventuelle) est affiché
- **And** deux actions sont disponibles : "Passer" et "Voir la réponse et les explications"
- **And** aucun chronomètre n'est affiché ou déclenché

### Scénario 2 : Passer la question sans consulter la réponse
- **Given** une question est affichée sans que la réponse ait été consultée
- **When** l'utilisateur active "Passer"
- **Then** la question est comptabilisée comme "passée"
- **And** une nouvelle question est tirée au hasard selon les mêmes règles

### Scénario 3 : Consulter la réponse
- **Given** une question est affichée
- **When** l'utilisateur active "Voir la réponse et les explications"
- **Then** la réponse (courte) s'affiche
- **And** les explications s'affichent également, sans action supplémentaire requise
- **And** deux boutons apparaissent sous la réponse : "J'ai trouvé" et "Je n'ai pas trouvé"
- **And** l'option "Passer" reste disponible

### Scénario 4 : Auto-évaluation positive
- **Given** la réponse et les explications sont affichées
- **When** l'utilisateur active "J'ai trouvé"
- **Then** la question est comptabilisée comme "réalisée / trouvée" pour son niveau
- **And** une nouvelle question est tirée au hasard selon les mêmes règles

### Scénario 5 : Auto-évaluation négative
- **Given** la réponse et les explications sont affichées
- **When** l'utilisateur active "Je n'ai pas trouvé"
- **Then** la question est comptabilisée comme "réalisée / non trouvée" pour son niveau
- **And** une nouvelle question est tirée au hasard selon les mêmes règles

### Scénario 6 : Passer après avoir consulté la réponse
- **Given** la réponse et les explications sont affichées
- **When** l'utilisateur active "Passer"
- **Then** la question est comptabilisée comme "passée" (et non comme réalisée)
- **And** une nouvelle question est tirée au hasard selon les mêmes règles

## Hors scope
- Limitation ou exclusion des questions déjà vues dans la session (répétition autorisée par choix produit).
- Chronométrage ou limite de temps par question.
- Consultation des statistiques de session (cf. Story 2.3).

## Notes pour la recette
- Vérifier que la pondération respecte bien les coefficients officiels renormalisés sur un échantillon significatif de tirages (test statistique).
- Vérifier qu'une question déjà vue peut effectivement ressortir dans un tirage ultérieur.
- Vérifier qu'aucune des trois actions finales ("Passer", "J'ai trouvé", "Je n'ai pas trouvé") ne laisse l'interface bloquée sans transition vers une nouvelle question.
