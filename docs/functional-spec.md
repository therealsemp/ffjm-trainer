# FFJM Trainer — Spécification fonctionnelle (v1)

## Vision

Outil d'entraînement aux épreuves du Championnat des Jeux Mathématiques (FFJM), basé sur les vraies annales officielles de la fédération, à destination d'un groupe restreint (famille, club).

## Utilisateurs

- Groupe restreint et connu (pas de grand public en v1).

## Contenu

- Source : archives officielles FFJM, au format PDF (sujets + corrigés détaillés, séparés), couvrant de nombreuses catégories d'âge et de nombreuses années/tours — une base volumineuse.
- Métadonnées stockées dès le départ pour chaque exercice :
  - **catégorie d'âge** (CE, CM, C1, C2, L1, L2, GP, ...)
  - **année**
  - **tour / session**
  - **thème** : champ réservé dans le modèle, non exploité en v1 (pas de source fiable pour le déterminer actuellement).
- Le contenu d'un énoncé ou d'une correction n'est pas toujours du texte simple : il peut inclure du calcul, de la géométrie, des tableaux, des schémas. Le modèle de contenu doit supporter du texte enrichi (texte + notation mathématique + figures), pas seulement du texte brut ou une image scannée.

## Règles d'affichage (UI)

- **Règle du nombre de solutions** : depuis au moins 2003, chaque épreuve FFJM affiche après la fin de la catégorie CM la consigne officielle suivante : *"Attention ! Pour qu'un problème soit complètement résolu, vous devez donner le nombre de ses solutions, et donner la solution s'il n'en a qu'une, ou deux solutions s'il en a plus d'une. Pour tous les problèmes susceptibles d'avoir plusieurs solutions, l'emplacement a été prévu pour écrire deux solutions (mais il se peut qu'il n'y en ait qu'une !)"* Ce n'est pas une donnée propre à un exercice ou à une année : c'est une règle générale du concours. Elle doit être affichée par l'application elle-même (pas stockée en base) dès que le **tier natif** de l'exercice présenté est strictement supérieur à CM, c'est-à-dire dès que `tier` (voir modèle de données) vaut `C1`, `C2`, `L1/GP` ou `L2/HC` — pas `CE` ni `CM`. Attention à ne pas se baser sur `categories` pour cette règle : en format cumulatif, un exercice de tier CE peut très bien apparaître dans `categories` de toutes les catégories (C1, C2... y ont aussi accès), ce qui déclencherait la consigne à tort.

## Hors scope v1

Explicitement écarté ou reporté à une itération future :

- Chronométrage façon concours réel.
- Historique détaillé/horodaté des sessions passées, ou graphiques d'évolution dans le temps. Des compteurs cumulés à vie (nombre total de questions passées/trouvées/non trouvées, tous niveaux et sessions confondus, voir Story 1.5) sont en revanche dans le périmètre v1 — ce n'est pas un historique, juste un total qui s'incrémente. Il en va de même pour le nombre de sessions terminées obtenues par rang (S+ à D, voir Story 2.7) : un compteur par rang, pas un historique des sessions.
- Génération automatique de nouveaux exercices.
- Filtrage ou exploitation par thème.
- Interface d'administration / import en direct dans l'application (l'import est un pipeline hors-ligne, exécuté en one-shot, pas une fonctionnalité de l'app v1).

## Contraintes

- Aucun coût d'infrastructure toléré à court terme : projet personnel/familial.
- Doit rester simple à utiliser sur ordinateur comme sur mobile (site web responsive, pas d'app native).
- Interface exclusivement en français, sans option de changement de langue : le public (FFJM) est francophone. Pas de gestion multilingue à prévoir.
