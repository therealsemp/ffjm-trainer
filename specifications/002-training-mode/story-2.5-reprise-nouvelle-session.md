# User Story 2.5 — Reprise ou nouvelle session

## Epic
EPIC 2 — Réalisation d'exercices (entraînement)

## Acteur
Utilisateur avec un profil actif

## User Story
**En tant qu'** utilisateur revenant sur le mode entraînement,
**je veux** pouvoir reprendre ma session en cours si elle existe, ou en démarrer une nouvelle,
**afin de** ne pas perdre ma progression si je le souhaite, tout en gardant la liberté de repartir à zéro.

## Contexte / Règles métier
- Une seule session peut être sauvegardée à la fois (pour le profil actif de l'appareil).
- Démarrer une nouvelle session supprime définitivement la session sauvegardée existante (statistiques comprises).
- La reprise d'une session se fait toujours en affichant directement une nouvelle question tirée au hasard (pas de restauration de l'état d'affichage précis de la dernière question consultée, cf. Story 2.2/2.4).

## Critères d'acceptation

### Scénario 1 : Aucune session existante
- **Given** l'utilisateur accède au mode entraînement
- **And** aucune session n'est sauvegardée pour son profil
- **When** la page se charge
- **Then** l'utilisateur est dirigé directement vers la configuration d'une nouvelle session (Story 2.1)

### Scénario 2 : Session existante — choix proposé
- **Given** l'utilisateur accède au mode entraînement
- **And** une session est sauvegardée pour son profil
- **When** la page se charge
- **Then** deux options sont proposées : "Reprendre la session en cours" et "Démarrer une nouvelle session"
- **And** les caractéristiques et statistiques de la session sauvegardée sont affichées à côté de l'option de reprise (niveaux sélectionnés, nombre de questions passées/trouvées/non trouvées)

### Scénario 3 : Reprise de la session en cours
- **Given** l'écran de choix de session est affiché
- **When** l'utilisateur active "Reprendre la session en cours"
- **Then** la session sauvegardée est réactivée avec ses niveaux sélectionnés et ses statistiques
- **And** une nouvelle question est tirée au hasard selon les règles de la Story 2.2
- **And** l'utilisateur est dirigé vers l'écran de question (Story 2.2)

### Scénario 4 : Démarrage d'une nouvelle session
- **Given** l'écran de choix de session est affiché
- **When** l'utilisateur active "Démarrer une nouvelle session"
- **Then** la session sauvegardée existante (niveaux, statistiques) est définitivement supprimée
- **And** l'utilisateur est dirigé vers la configuration d'une nouvelle session (Story 2.1)

## Hors scope
- Conservation d'un historique des sessions précédentes après suppression.
- Possibilité d'avoir plusieurs sessions sauvegardées en parallèle.

## Notes pour la recette
- Vérifier qu'après suppression (nouvelle session), l'ancienne session n'est plus récupérable.
- Vérifier que la reprise restaure bien exactement les compteurs sauvegardés (cohérence avec Story 2.4).
- Vérifier le comportement si le profil est supprimé (Story 1.3) : la session associée doit également être supprimée.
