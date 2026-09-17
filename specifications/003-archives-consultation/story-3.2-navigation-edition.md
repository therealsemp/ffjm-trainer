# User Story 3.2 — Navigation dans les questions de l'édition

## Epic
EPIC 3 — Consultation d'une édition

## Acteur
Utilisateur consultant une édition sélectionnée

## User Story
**En tant qu'** utilisateur consultant une édition,
**je veux** parcourir les exercices dans l'ordre officiel de l'épreuve, en avançant ou reculant librement,
**afin de** revivre le concours comme il s'est déroulé ou de revenir sur un exercice déjà vu.

## Contexte / Règles métier
- Les exercices d'une édition sont affichés un par un, dans l'ordre officiel de l'épreuve (ordre croissant de difficulté, tel que dans le concours réel).
- La position dans l'édition est indiquée à l'utilisateur (ex. "Question 4/16").
- Cette story ne couvre pas l'affichage ou le masquage des réponses (cf. Story 3.3), qui s'applique par-dessus cette navigation.

## Critères d'acceptation

### Scénario 1 : Affichage de la première question
- **Given** l'utilisateur vient de valider la sélection d'une édition (Story 3.1)
- **When** l'écran de consultation s'affiche
- **Then** la première question de l'édition est affichée
- **And** l'indicateur de position affiche "Question 1/N" (N étant le nombre total d'exercices de l'édition)

### Scénario 2 : Navigation vers la question suivante
- **Given** l'utilisateur consulte la question K (K < N)
- **When** il active "Suivant"
- **Then** la question K+1 est affichée
- **And** l'indicateur de position est mis à jour

### Scénario 3 : Navigation vers la question précédente
- **Given** l'utilisateur consulte la question K (K > 1)
- **When** il active "Précédent"
- **Then** la question K-1 est affichée
- **And** l'indicateur de position est mis à jour

### Scénario 4 : Limite en fin d'édition
- **Given** l'utilisateur consulte la dernière question de l'édition (K = N)
- **Then** le bouton "Suivant" est désactivé ou masqué (aucune action possible au-delà de la dernière question)

### Scénario 5 : Limite en début d'édition
- **Given** l'utilisateur consulte la première question de l'édition (K = 1)
- **Then** le bouton "Précédent" est désactivé ou masqué (aucune action possible avant la première question)

## Hors scope
- Saut direct vers une question précise via une liste ou un sélecteur (navigation uniquement séquentielle en v1).
- Mémorisation de la dernière question consultée en cas de sortie/retour sur cette édition (chaque nouvelle sélection d'édition repart de la question 1).

## Notes pour la recette
- Vérifier que l'indicateur de position reste toujours cohérent avec la question affichée.
- Vérifier qu'il est impossible de sortir des bornes 1 et N par un clic répété sur "Précédent"/"Suivant".
