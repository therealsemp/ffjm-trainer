# User Story 2.1 — Configuration d'une session d'entraînement

## Epic
EPIC 2 — Réalisation d'exercices (entraînement)

## Acteur
Utilisateur avec un profil actif

## User Story
**En tant qu'** utilisateur souhaitant m'entraîner,
**je veux** choisir les niveaux de questions à inclure dans ma session avant de commencer,
**afin de** m'entraîner sur les niveaux qui me conviennent, dans la limite de mon niveau maximal.

## Contexte / Règles métier
- Les niveaux proposés vont du plus simple jusqu'au niveau de la catégorie du profil actif (niveau maximum autorisé).
- Chaque niveau est représenté par une case activable/désactivable.
- Par défaut, tous les niveaux sont désactivés.
- Un bouton permet d'activer tous les niveaux disponibles en une seule action.
- Au moins un niveau doit être sélectionné pour démarrer la session.
- Cette story ne s'applique que lorsqu'il n'y a pas de session en cours à reprendre (cf. Story 2.5).

## Critères d'acceptation

### Scénario 1 : Affichage des niveaux disponibles
- **Given** l'utilisateur a un profil actif de catégorie X
- **When** il accède à la configuration d'une nouvelle session d'entraînement
- **Then** tous les niveaux allant du plus simple jusqu'à la catégorie X (incluse) sont affichés
- **And** les niveaux supérieurs à la catégorie X ne sont pas proposés
- **And** chaque niveau est présenté sous forme de case désactivée par défaut

### Scénario 2 : Activation manuelle d'un ou plusieurs niveaux
- **Given** l'utilisateur est sur l'écran de configuration
- **When** il active une ou plusieurs cases de niveau
- **Then** les niveaux correspondants sont marqués comme sélectionnés
- **And** le bouton de validation devient utilisable

### Scénario 3 : Activer tous les niveaux
- **Given** l'utilisateur est sur l'écran de configuration
- **When** il active le bouton "Tout activer"
- **Then** tous les niveaux disponibles (jusqu'à sa catégorie) sont sélectionnés

### Scénario 4 : Validation sans sélection
- **Given** l'utilisateur est sur l'écran de configuration
- **And** aucun niveau n'est sélectionné
- **When** il tente de valider
- **Then** la validation est bloquée
- **And** un message indique qu'au moins un niveau doit être sélectionné

### Scénario 5 : Validation réussie
- **Given** l'utilisateur a sélectionné au moins un niveau
- **When** il valide la configuration
- **Then** une nouvelle session est créée avec les niveaux sélectionnés
- **And** l'utilisateur est dirigé vers l'écran de la première question (Story 2.2)

## Hors scope
- Modification des niveaux sélectionnés en cours de session (le choix est fixé à la création de la session).
- Pondération/priorisation manuelle entre niveaux par l'utilisateur (la pondération est automatique, cf. Story 2.2).

## Notes pour la recette
- Vérifier qu'un profil de catégorie CE ne voit qu'un seul niveau proposé (CE), puisqu'il s'agit du niveau le plus bas.
- Vérifier qu'un profil de catégorie HC voit bien les 8 niveaux proposés.
