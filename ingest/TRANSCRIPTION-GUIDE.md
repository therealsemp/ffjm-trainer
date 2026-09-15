# Guide de transcription PDF → JSON

Il n'y a pas de script déterministe qui fait cette transcription : c'est un modèle qui lit les PDF (énoncé + corrigé) et rédige le JSON à la main. Ce document existe pour que cette transcription reste cohérente d'une session à l'autre — à relire avant de traiter un nouvel examen.

Trouvé en pratique lors de la revue de 2026-qf : la tendance naturelle est de "résumer" le contenu plutôt que de le transcrire fidèlement. C'est une erreur à éviter — voir les règles ci-dessous.

## Règles

1. **Ne jamais aplatir une liste en prose.** Si le PDF source présente une liste à puces ou numérotée (tirets `—`, puces `•`, énumération `(1) (2) (3)`...), la reproduire comme une liste markdown (`- item`), pas comme une phrase avec des points-virgules ou des "et". Ça vaut aussi bien pour l'énoncé que pour la correction.

2. **Ne jamais condenser un raisonnement.** Une démonstration à plusieurs étapes, une disjonction de cas, une liste de remarques : transcrire chaque étape, pas un résumé de l'idée générale. Le but est que la correction affichée dans l'app soit aussi complète que le PDF source, pas une synthèse. Si le raisonnement est long, c'est normal que le markdown le soit aussi.

3. **Figures : toujours une vraie extraction, jamais une reconstruction approximative.** Une figure (schéma, image, graphique) se récupère avec `render-page.mjs` + `crop-figure.mjs` (recadrage réel depuis le PDF rendu), jamais en la redessinant "de tête" en SVG ou en la décrivant en texte à la place. Si une figure présente dans le PDF est ratée à la première passe, la rattraper dès qu'elle est repérée — voir `data/validated/2026/qf/q01.json` pour un exemple corrigé après coup.

3bis. **Toujours cropper avec de la marge généreuse À L'EXTÉRIEUR de la figure perçue, jamais au plus près.** La boîte de recadrage doit déborder au-delà de ce qu'on pense être les bords de la figure, pas s'y ajuster pile. Le compromis est asymétrique et assumé : un peu de fond superflu autour (voire un bout de lettre d'un mot voisin qui traîne au bord) est un artefact mineur et sans conséquence, alors que couper un axe, une légende ou un angle de la figure elle-même est une vraie perte d'information. En cas de doute sur la taille de la boîte, toujours arrondir vers le plus grand. Repéré sur Q2 (chapeau) et Q17 (graphique) de 2026-qf, acceptées après une seule passe sans marge suffisante.

4. **Ne jamais ajouter une figure qui n'est pas réellement dans la source à cet endroit.** Réutiliser une image de l'énoncé dans la correction pour aider visuellement peut sembler une bonne idée, mais ça trompe la revue (on croit relire fidèlement le PDF de correction alors qu'un élément a été ajouté) — repéré sur Q2 où le schéma de l'énoncé avait été dupliqué dans la correction alors que le PDF de correction ne contient que du texte à cet endroit.

5. **Conserver la mise en forme du sens du PDF**, pas juste le texte : gras (`**Réponse : ...**`), italique (titres d'articles/livres cités en référence), tableaux (markdown table quand le PDF en a un).

6. **Après une transcription, se relire en cherchant spécifiquement** : des listes aplaties, du texte résumé plutôt que transcrit, des figures manquantes ou coupées, des figures ajoutées qui ne sont pas dans la source. Ce sont les erreurs récurrentes identifiées jusqu'ici.

## Pourquoi ce document et pas un script

Automatiser complètement cette étape (OCR + parsing structuré) serait fragile sur des PDF aussi variés (mise en page différente par année, mélange texte/maths/figures/tableaux). L'approche retenue est volontairement "IA + revue humaine" (voir `docs/technical-architecture.md`) — ce guide réduit le taux d'erreur côté IA, la revue humaine (outil `/review`) reste la garde-fou final.
