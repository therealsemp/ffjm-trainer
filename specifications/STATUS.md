# Implementation status

Tracked in this one file rather than a field inside each story — same reasoning as the data model's validation state (see `docs/technical-architecture.md`): a status field scattered across 12 files is easy to forget to update, one central list isn't.

Update this file whenever a story's implementation state changes. Values: `Not started`, `In progress`, `Done`.

## EPIC 1 — Account management

| Story | Status | Notes |
|---|---|---|
| 1.1 — Detection/redirection | Done | |
| 1.2 — Profile creation | Done | |
| 1.3 — Account access and profile reset | Done | |
| 1.4 — Theme preference | Done | |
| 1.5 — Account statistics | Not started | Split out of 1.3 — blocked on EPIC 2 (nothing to show until session stats exist). Page currently shows a placeholder message. |

## EPIC 2 — Training mode

| Story | Status | Notes |
|---|---|---|
| 2.1 — Session configuration | Not started | |
| 2.2 — Question flow | Not started | Needs the build-time data index (`questionMetadataService`/`questionService`, see `docs/technical-architecture.md`) — not built yet. |
| 2.3 — Session stats view | Not started | |
| 2.4 — Statistics saving | Not started | |
| 2.5 — Resume or new session | Not started | |

## EPIC 3 — Archives consultation

| Story | Status | Notes |
|---|---|---|
| 3.1 — Edition selection | Not started | Same data-index dependency as 2.2. |
| 3.2 — Edition navigation | Not started | |
| 3.3 — Answer display | Not started | |
