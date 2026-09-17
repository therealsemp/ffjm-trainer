# User Story 3.3 — Affichage/masquage global des réponses

## Epic
EPIC 3 — Consultation d'une édition

## Acteur
Utilisateur consultant une édition sélectionnée

## User Story
**En tant qu'** utilisateur consultant une édition,
**je veux** un interrupteur global pour afficher ou masquer les réponses,
**afin de** choisir librement, à tout moment, de chercher seul ou de vérifier les corrections.

## Contexte / Règles métier
- L'interrupteur est unique pour toute la consultation de l'édition (pas de réglage par question).
- Il est visible en permanence pendant la consultation, quelle que soit la question affichée.
- Son état s'applique immédiatement à la question actuellement affichée, ainsi qu'à toutes les questions suivantes consultées (jusqu'à ce qu'il soit rebasculé).
- Par défaut, au démarrage de la consultation d'une édition, les réponses sont masquées.

## Critères d'acceptation

### Scénario 1 : État par défaut
- **Given** l'utilisateur vient de valider la sélection d'une édition (Story 3.1)
- **When** la première question s'affiche
- **Then** l'interrupteur "Afficher les réponses" est sur "masqué" (OFF)
- **And** aucune réponse n'est visible sur la question affichée

### Scénario 2 : Activation de l'affichage des réponses
- **Given** l'utilisateur consulte une question quelconque, réponses masquées
- **When** il active l'interrupteur "Afficher les réponses"
- **Then** la réponse (et l'explication) de la question actuellement affichée apparaît immédiatement
- **And** l'interrupteur reste sur "affiché" (ON) pour les questions suivantes consultées

### Scénario 3 : Désactivation de l'affichage des réponses
- **Given** l'utilisateur consulte une question quelconque, réponses affichées
- **When** il désactive l'interrupteur "Afficher les réponses"
- **Then** la réponse et l'explication de la question actuellement affichée sont masquées immédiatement
- **And** l'interrupteur reste sur "masqué" (OFF) pour les questions suivantes consultées

### Scénario 4 : Persistance de l'état pendant la navigation
- **Given** l'interrupteur est réglé sur "affiché" (ou "masqué")
- **When** l'utilisateur navigue vers une autre question (Précédent/Suivant, Story 3.2)
- **Then** le réglage de l'interrupteur reste inchangé
- **And** la nouvelle question affichée respecte cet état (réponse visible ou non, en cohérence avec l'interrupteur)

## Hors scope
- Réglage individuel de l'affichage par question.
- Mémorisation de l'état de l'interrupteur d'une session de consultation à l'autre (chaque nouvelle sélection d'édition repart sur "masqué" par défaut).

## Notes pour la recette
- Vérifier que le changement d'état de l'interrupteur s'applique instantanément sans rechargement de page.
- Vérifier que l'état de l'interrupteur est bien conservé lors de la navigation entre plusieurs questions consécutives.
