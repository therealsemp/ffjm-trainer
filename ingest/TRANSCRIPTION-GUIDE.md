# Guide de transcription PDF → JSON

Il n'y a pas de script déterministe qui fait cette transcription : c'est un modèle qui lit les PDF (énoncé + corrigé) et rédige le JSON à la main. Ce document existe pour que cette transcription reste cohérente d'une session à l'autre — à relire avant de traiter un nouvel examen.

Trouvé en pratique lors de la revue de 2026-qf : la tendance naturelle est de "résumer" le contenu plutôt que de le transcrire fidèlement. C'est une erreur à éviter — voir les règles ci-dessous.

## Règles

1. **Ne jamais aplatir une liste en prose.** Si le PDF source présente une liste à puces ou numérotée (tirets `—`, puces `•`, énumération `(1) (2) (3)`...), la reproduire comme une liste markdown (`- item`), pas comme une phrase avec des points-virgules ou des "et". Ça vaut aussi bien pour l'énoncé que pour la correction.

2. **Ne jamais condenser un raisonnement.** Une démonstration à plusieurs étapes, une disjonction de cas, une liste de remarques : transcrire chaque étape, pas un résumé de l'idée générale. Le but est que la correction affichée dans l'app soit aussi complète que le PDF source, pas une synthèse. Si le raisonnement est long, c'est normal que le markdown le soit aussi.

3. **Figures : toujours une vraie extraction, jamais une reconstruction approximative.** Une figure (schéma, image, graphique) se récupère avec `render-page.mjs` + `crop-figure.mjs` (recadrage réel depuis le PDF rendu), jamais en la redessinant "de tête" en SVG ou en la décrivant en texte à la place. Si une figure présente dans le PDF est ratée à la première passe, la rattraper dès qu'elle est repérée — voir `data/needs-review/2026_qf_q01.json` pour un exemple corrigé après coup.

4. **Conserver la mise en forme du sens du PDF**, pas juste le texte : gras (`**Réponse : ...**`), italique (titres d'articles/livres cités en référence), tableaux (markdown table quand le PDF en a un).

5. **Après une transcription, se relire en cherchant spécifiquement** : des listes aplaties, du texte résumé plutôt que transcrit, des figures manquantes. Ce sont les trois erreurs récurrentes identifiées jusqu'ici.

## Pourquoi ce document et pas un script

Automatiser complètement cette étape (OCR + parsing structuré) serait fragile sur des PDF aussi variés (mise en page différente par année, mélange texte/maths/figures/tableaux). L'approche retenue est volontairement "IA + revue humaine" (voir `docs/technical-architecture.md`) — ce guide réduit le taux d'erreur côté IA, la revue humaine (outil `/review`) reste la garde-fou final.
