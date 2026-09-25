import type { Rank } from "../types/trainingSession"

// Preloaded once at module load, not per-play — reusing the same elements
// (rewinding via currentTime) avoids a fresh request/decode on every click.
function preloaded(file: string): HTMLAudioElement {
  const audio = new Audio(`${import.meta.env.BASE_URL}audio/${file}`)
  audio.preload = "auto"
  return audio
}

const sounds = {
  ok: preloaded("answer-ok.mp3"),
  ko: preloaded("answer-ko.mp3"),
}

// Story 2.7 — one file per rank, always, even when several ranks currently
// share the same sound (the files are then just copies): grouping ranks is
// a content decision made by swapping files in public/audio/, never a code
// change.
const rankSounds: Record<Rank, HTMLAudioElement> = {
  "S+": preloaded("session-s-plus.mp3"),
  S: preloaded("session-s.mp3"),
  A: preloaded("session-a.mp3"),
  B: preloaded("session-b.mp3"),
  C: preloaded("session-c.mp3"),
  D: preloaded("session-d.mp3"),
}

function play(audio: HTMLAudioElement): void {
  audio.currentTime = 0
  // A rejected play() (autoplay policy, missing file) must never break the
  // page — the sound is a bonus, not part of the flow.
  void audio.play().catch(() => {})
}

export function playSound(kind: "ok" | "ko"): void {
  play(sounds[kind])
}

export function playRankSound(rank: Rank): void {
  play(rankSounds[rank])
}
