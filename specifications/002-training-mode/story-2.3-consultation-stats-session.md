# User Story 2.3 — Consultation des statistiques de la session en cours

## Epic
EPIC 2 — Réalisation d'exercices (entraînement)

## Acteur
Utilisateur en session d'entraînement active

## User Story
**En tant qu'** utilisateur en session d'entraînement,
**je veux** consulter à tout moment les statistiques de ma session en cours,
**afin de** suivre ma progression sans interrompre mon entraînement.

## Contexte / Règles métier
- L'accès aux statistiques se fait via une icône visible en permanence pendant le déroulement d'une question (Story 2.2).
- La consultation se fait dans une popup/modal, sans quitter l'écran de la question en cours.
- Les statistiques affichées sont celles de la session en cours uniquement (pas l'historique global du profil).

## Critères d'acceptation

### Scénario 1 : Accès aux statistiques depuis une question
- **Given** l'utilisateur est en session active, une question étant affichée (avant ou après consultation de la réponse)
- **When** il active l'icône de statistiques
- **Then** une popup/modal s'ouvre par-dessus l'écran actuel
- **And** l'écran de la question reste inchangé en arrière-plan

### Scénario 2 : Contenu affiché dans la popup
- **Given** la popup de statistiques est ouverte
- **Then** elle affiche : les niveaux sélectionnés pour la session, le nombre total de questions passées, le nombre total de questions réalisées (trouvées + non trouvées), le détail trouvées/non trouvées global, et le détail passées/trouvées/non trouvées par niveau sélectionné

### Scénario 3 : Fermeture de la popup
- **Given** la popup de statistiques est ouverte
- **When** l'utilisateur la ferme
- **Then** il revient exactement à l'état de la question affichée avant l'ouverture (aucune donnée de la question en cours n'est perdue ou modifiée)

## Hors scope
- Statistiques cumulées sur plusieurs sessions ou historique long terme (relève d'une évolution future du profil, hors EPIC 2).
- Export ou partage des statistiques de session.
- Représentation graphique (courbes, diagrammes) — un affichage texte/liste suffit en v1.

## Notes pour la recette
- Vérifier que l'ouverture/fermeture de la popup n'entraîne aucune perte d'état sur la question en cours (notamment si la réponse était déjà affichée).
- Vérifier que les chiffres affichés correspondent exactement aux données sauvegardées (cf. Story 2.4).
