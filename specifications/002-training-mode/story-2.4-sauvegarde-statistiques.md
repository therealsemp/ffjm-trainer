# User Story 2.4 — Sauvegarde continue des statistiques de la session

## Epic
EPIC 2 — Réalisation d'exercices (entraînement)

## Acteur
Système (déclenché par les actions de l'utilisateur en session)

## User Story
**En tant qu'** utilisateur en session d'entraînement,
**je veux** que les caractéristiques et statistiques de ma session soient sauvegardées après chaque action,
**afin de** ne rien perdre si je quitte l'application et pouvoir la reprendre plus tard (cf. Story 2.5).

## Contexte / Règles métier
- La sauvegarde est locale (même mécanisme de stockage que le profil : navigateur/appareil).
- La sauvegarde a lieu après chaque action sur une question : "Passer", "J'ai trouvé", "Je n'ai pas trouvé".
- Les données sauvegardées permettent une reprise à l'identique des statistiques (mais pas de l'état d'affichage précis de la dernière question, cf. Story 2.5).

## Données à sauvegarder
- Niveaux sélectionnés pour la session
- Nombre total de questions passées
- Nombre total de questions réalisées, réparti en trouvées / non trouvées
- Pour chaque niveau sélectionné : nombre de questions passées / trouvées / non trouvées

## Critères d'acceptation

### Scénario 1 : Sauvegarde après "Passer"
- **Given** une question est affichée
- **When** l'utilisateur active "Passer"
- **Then** le compteur global de questions passées est incrémenté et sauvegardé
- **And** le compteur de questions passées du niveau concerné est incrémenté et sauvegardé

### Scénario 2 : Sauvegarde après "J'ai trouvé"
- **Given** la réponse est affichée pour une question
- **When** l'utilisateur active "J'ai trouvé"
- **Then** le compteur global de questions trouvées est incrémenté et sauvegardé
- **And** le compteur de questions trouvées du niveau concerné est incrémenté et sauvegardé

### Scénario 3 : Sauvegarde après "Je n'ai pas trouvé"
- **Given** la réponse est affichée pour une question
- **When** l'utilisateur active "Je n'ai pas trouvé"
- **Then** le compteur global de questions non trouvées est incrémenté et sauvegardé
- **And** le compteur de questions non trouvées du niveau concerné est incrémenté et sauvegardé

### Scénario 4 : Persistance après fermeture de l'application
- **Given** une session comporte des statistiques déjà sauvegardées
- **When** l'utilisateur ferme l'application puis la réouvre
- **Then** les statistiques sauvegardées sont intactes et disponibles pour la reprise de session (Story 2.5)

## Hors scope
- Sauvegarde de l'état précis d'affichage de la question en cours (texte affiché, réponse visible ou non) — la reprise se fait toujours sur une nouvelle question (cf. Story 2.5).
- Historique détaillé question par question (seuls les compteurs agrégés sont conservés).

## Notes pour la recette
- Vérifier qu'aucune action sur une question n'est possible sans déclencher la sauvegarde correspondante.
- Vérifier la cohérence des compteurs globaux avec la somme des compteurs par niveau.
- Simuler une fermeture brutale (rechargement de page) juste après une action pour vérifier qu'aucune donnée n'est perdue.
