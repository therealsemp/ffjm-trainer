# User Story 1.3 — Accès au compte, statistiques et suppression du profil

## Epic
EPIC 1 — Gestion des profils

## Acteur
Utilisateur ayant déjà un profil actif sur cet appareil

## User Story
**En tant qu'** utilisateur avec un profil actif,
**je veux** accéder à un espace "Mon compte" pour consulter mes statistiques ou supprimer mon profil,
**afin de** suivre ma progression ou libérer l'appareil pour qu'un autre utilisateur puisse créer son propre profil.

## Contexte / Règles métier
- Toutes les données du profil (identité, catégorie, statistiques) sont stockées uniquement sur cet appareil/navigateur, via cookie/stockage local — aucune sauvegarde serveur.
- La suppression est définitive et locale : elle n'affecte que cet appareil.

## Critères d'acceptation

### Scénario 1 : Accès à l'espace compte
- **Given** l'utilisateur a un profil actif et se trouve sur la page d'accueil
- **When** il active le point d'accès "Mon compte"
- **Then** une page s'affiche avec : le nom du profil, la catégorie FFJM associée, et les statistiques du profil

### Scénario 2 : Consultation des statistiques
- **Given** l'utilisateur est sur la page "Mon compte"
- **Then** les statistiques de base sont visibles (contenu exact à définir avec le détail de l'EPIC 2 : ex. nombre de questions vues, trouvées, non trouvées)

### Scénario 3 : Demande de suppression du profil
- **Given** l'utilisateur est sur la page "Mon compte"
- **When** il active le bouton "Supprimer mon profil"
- **Then** une pop-up de confirmation s'affiche
- **And** cette pop-up explique clairement que les données sont stockées uniquement sur cet appareil/navigateur et que la suppression est définitive (ex. : "Toutes tes données — profil et progression — sont stockées uniquement sur cet appareil. Si tu confirmes, elles seront définitivement effacées.")
- **And** la pop-up propose deux actions : "Annuler" et "Confirmer la suppression"

### Scénario 4 : Confirmation de la suppression
- **Given** la pop-up de confirmation de suppression est affichée
- **When** l'utilisateur active "Confirmer la suppression"
- **Then** le cookie de profil et toutes les données associées (statistiques, progression) sont effacés
- **And** l'utilisateur est redirigé vers la page de création de profil (Story 1.2)

### Scénario 5 : Annulation de la suppression
- **Given** la pop-up de confirmation de suppression est affichée
- **When** l'utilisateur active "Annuler"
- **Then** la pop-up se ferme
- **And** aucune donnée n'est modifiée ou supprimée
- **And** l'utilisateur reste sur la page "Mon compte"

## Hors scope
- Export ou sauvegarde des données avant suppression.
- Récupération d'un profil supprimé.
- Statistiques avancées (historique détaillé, graphiques d'évolution dans le temps) — le contenu précis des statistiques sera affiné lors du détail de l'EPIC 2.

## Notes pour la recette
- Vérifier qu'aucune suppression n'est possible sans passer par l'étape de confirmation.
- Vérifier que le message de la pop-up mentionne explicitement le caractère local et définitif de la suppression.
- Vérifier que le rechargement de la page après suppression renvoie bien vers la création de profil (et non vers un profil fantôme).
