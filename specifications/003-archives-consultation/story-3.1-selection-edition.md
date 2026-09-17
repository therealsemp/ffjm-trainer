# User Story 3.1 — Sélection d'une édition

## Epic
EPIC 3 — Consultation d'une édition

## Acteur
Utilisateur avec un profil actif

## User Story
**En tant qu'** utilisateur souhaitant consulter des archives,
**je veux** choisir une année, une phase et une catégorie,
**afin d'** accéder aux exercices précis de l'édition qui m'intéresse.

## Contexte / Règles métier
- Chaque édition (année + phase) contient des exercices pour chacune des 8 catégories FFJM.
- La sélection n'est pas limitée par la catégorie du profil actif : l'utilisateur peut consulter n'importe quelle catégorie, quel que soit son propre niveau.
- Les trois critères (année, phase, catégorie) sont nécessaires pour identifier un jeu d'exercices précis.

## Critères d'acceptation

### Scénario 1 : Affichage des critères de sélection
- **Given** l'utilisateur accède au mode "Consultation d'édition"
- **Then** trois sélecteurs sont proposés : année, phase, catégorie
- **And** les valeurs proposées correspondent aux éditions/phases/catégories réellement disponibles dans les données

### Scénario 2 : Sélection complète et validation
- **Given** l'utilisateur a choisi une année, une phase et une catégorie
- **When** il valide sa sélection
- **Then** il est dirigé vers la première question de l'édition sélectionnée (Story 3.2)
- **And** le réglage d'affichage des réponses est initialisé sur "masqué" par défaut (Story 3.3)

### Scénario 3 : Sélection incomplète
- **Given** l'utilisateur n'a pas renseigné les trois critères (année, phase, catégorie)
- **When** il tente de valider
- **Then** la validation est bloquée
- **And** un message indique les critères manquants

### Scénario 4 : Combinaison sans exercices disponibles
- **Given** l'utilisateur a sélectionné une combinaison année/phase/catégorie pour laquelle aucun exercice n'existe dans les données
- **When** il tente de valider
- **Then** un message clair l'informe qu'aucun exercice n'est disponible pour cette combinaison
- **And** il reste sur l'écran de sélection pour ajuster son choix

## Hors scope
- Filtrage ou recommandation basée sur la catégorie du profil actif.
- Sauvegarde d'un historique des éditions déjà consultées.

## Notes pour la recette
- Vérifier que les sélecteurs ne proposent que des combinaisons année/phase réellement présentes dans les données (pas d'année sans aucune phase disponible).
- Vérifier le message d'erreur sur une combinaison vide (si les données le permettent en test).
