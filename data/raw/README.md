# Raw FFJM archives

Source PDFs for FFJM Trainer, downloaded from the FFJM's official archive page:
https://www.ffjm.org/fr/archives-du-championnat

Retrieved: 2026-09-15.

## Scope and selection criteria

- Years 2000–2026 (older years exist on the page but were intentionally excluded — see functional/technical specs in `/docs`).
- Only the **quarter-final** (`qf`), **semi-final** (`sf`) and **national final** (`fn`) phases. International-final phases and regional finals are excluded.
- Only the **French-language statement** for each phase (other languages on the page are ignored).
- Only phases for which the page also links a **detailed solution** (not just a plain answer key) — a phase without one was skipped entirely.

## Naming convention

```
raw/{year}/{phase}/{year}_{phase}_{type}.pdf
```

- `phase`: `qf` | `sf` | `fn`
- `type`: `statement` | `solution-detailed` (or `solution-detailed-1` / `solution-detailed-2` when the page listed two separate detailed-solution files for the same phase — both are worth keeping, one is sometimes more thorough than the other and it isn't obvious upfront which)

## Known gaps

Coverage isn't uniform — this reflects real gaps in what FFJM published/archived per year, not an extraction bug:

- **2003, 2004, 2019**: only `sf` has a detailed solution (`qf` exists but only with a plain answer key).
- **2005**: only `qf` has a detailed solution.
- **2014–2017**: only `sf` has a detailed solution.
- **2000–2002, 2006–2008**: neither `qf` nor `sf` has a detailed solution for that year.
- **2021**: `qf`/`sf` are covered, but `fn` has no detailed solution (only a plain answer key).
- Most years between 2000 and 2019 have **no separate "finale nationale" phase archived at all** (only `qf`/`sf` + international finals, which are out of scope). `fn` only reliably appears from **2020** onward.
- **2000** did have an `fn` entry, but with no detailed solution — excluded.
- **2001** has a "finale régionale" phase instead of "finale nationale" — excluded (different phase, not in scope).

(The original per-file provenance manifest — source URL, championship number, detected phase label — was a one-shot scraping artifact and has since been deleted; this README is what's kept as the record of scope and gaps.)
