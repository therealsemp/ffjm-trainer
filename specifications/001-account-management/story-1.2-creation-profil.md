# User Story 1.2 — Création de profil

## Epic
EPIC 1 — Gestion des profils

## Acteur
Utilisateur sans profil enregistré sur cet appareil (enfant, avec ou sans aide d'un parent)

## User Story
**En tant qu'** utilisateur sans profil,
**je veux** créer un profil simple en indiquant mon nom et ma catégorie FFJM,
**afin de** commencer à m'entraîner avec des questions adaptées à mon niveau.

## Contexte / Règles métier
- Aucune limitation sur les catégories proposées : les 8 catégories officielles FFJM sont toutes disponibles.
- Chaque catégorie doit être présentée avec une description claire du niveau scolaire correspondant, pour que l'utilisateur puisse choisir sans connaître le jargon FFJM.
- Le profil créé est stocké uniquement via un cookie local (pas de compte serveur).

## Catégories disponibles à la sélection

| Catégorie affichée | Code interne | Correspondance |
|---|---|---|
| CE1 / CE2 | CE | Écoliers cours élémentaire |
| CM1 / CM2 | CM | Écoliers cours moyen |
| 6e / 5e | C1 | Collégiens cycle 1 |
| 4e / 3e | C2 | Collégiens cycle 2 |
| 2nde / 1ère / Terminale | L1 | Lycéens |
| Étudiant (Bac+1 à Bac+5) | L2 | Étudiants |
| Adulte, grand public | GP | Grand public |
| Haute compétition | HC | Compétiteurs confirmés |

## Critères d'acceptation

### Scénario 1 : Création réussie
- **Given** l'utilisateur est sur la page de création de profil
- **When** il saisit un nom non vide
- **And** il sélectionne une catégorie parmi les 8 proposées, chacune affichée avec sa description en clair (ex. "6e / 5e")
- **And** il valide le formulaire
- **Then** un cookie de profil est créé, contenant le nom et le code de catégorie choisi
- **And** l'utilisateur est redirigé vers la page d'accueil de son profil

### Scénario 2 : Nom vide
- **Given** l'utilisateur est sur la page de création de profil
- **When** il tente de valider le formulaire sans avoir saisi de nom
- **Then** la validation est bloquée
- **And** un message indique que le nom est requis

### Scénario 3 : Aucune catégorie sélectionnée
- **Given** l'utilisateur est sur la page de création de profil
- **When** il tente de valider le formulaire sans avoir choisi de catégorie
- **Then** la validation est bloquée
- **And** un message indique qu'une catégorie doit être sélectionnée

### Scénario 4 : Lisibilité des catégories
- **Given** l'utilisateur consulte le sélecteur de catégories
- **Then** chaque option affiche la correspondance scolaire en clair (ex. "CE1 / CE2") et non uniquement le code FFJM ("CE")

## Hors scope
- Modification a posteriori de la catégorie (changement de niveau d'une année sur l'autre) — à traiter dans une story ultérieure si besoin.
- Vérification d'unicité du nom entre plusieurs profils (un seul profil actif à la fois sur l'appareil).

## Notes pour la recette
- Vérifier que les 8 catégories sont bien toutes proposées, sans restriction.
- Vérifier la lisibilité du libellé de chaque catégorie pour un enfant ne connaissant pas les sigles FFJM.
