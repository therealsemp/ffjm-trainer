# User Story 1.1 — Détection et redirection automatique au chargement

## Epic
EPIC 1 — Gestion des profils

## Acteur
Utilisateur (enfant ou parent utilisant l'appareil)

## User Story
**En tant qu'** utilisateur ouvrant l'application,
**je veux** être automatiquement redirigé vers mon espace si j'ai déjà un profil enregistré sur cet appareil, ou vers la création de profil sinon,
**afin de** ne pas avoir à me réidentifier à chaque ouverture et d'accéder directement à mon entraînement.

## Contexte / Règles métier
- Le profil est stocké localement via un cookie du navigateur (pas de compte serveur, pas d'authentification).
- Un seul profil actif à la fois par navigateur/appareil.
- Cette story s'exécute automatiquement au chargement de l'application, sans action de l'utilisateur.

## Critères d'acceptation

### Scénario 1 : Profil existant et valide
- **Given** un cookie de profil valide est présent dans le navigateur (contient un nom et une catégorie reconnue)
- **When** l'utilisateur ouvre l'application
- **Then** l'application redirige automatiquement vers la page d'accueil du profil, sans écran intermédiaire
- **And** aucune action de l'utilisateur n'est requise

### Scénario 2 : Aucun profil enregistré
- **Given** aucun cookie de profil n'est présent dans le navigateur
- **When** l'utilisateur ouvre l'application
- **Then** l'application redirige automatiquement vers la page de création de profil (Story 1.2)

### Scénario 3 : Profil corrompu ou invalide
- **Given** un cookie de profil est présent mais son contenu est invalide (catégorie inconnue, format incorrect, nom manquant)
- **When** l'utilisateur ouvre l'application
- **Then** l'application traite ce cas comme "aucun profil"
- **And** redirige vers la page de création de profil (Story 1.2)
- **And** le cookie invalide est ignoré ou nettoyé (ne provoque pas d'erreur bloquante)

## Hors scope
- Gestion de plusieurs profils simultanés sur le même navigateur.
- Synchronisation entre appareils/navigateurs différents.
- Authentification par mot de passe.

## Notes pour la recette
- Vérifier le comportement après suppression manuelle du cookie par les outils développeur du navigateur.
- Vérifier le comportement après modification manuelle de la valeur du cookie (test de robustesse).
