// Preloaded once at module load, not per-play — reusing the same elements
// (rewinding via currentTime) avoids a fresh request/decode on every click.
const sounds = {
  ok: new Audio(`${import.meta.env.BASE_URL}audio/answer-ok.mp3`),
  ko: new Audio(`${import.meta.env.BASE_URL}audio/answer-ko.mp3`),
}
sounds.ok.preload = "auto"
sounds.ko.preload = "auto"

export function playSound(kind: "ok" | "ko"): void {
  const audio = sounds[kind]
  audio.currentTime = 0
  void audio.play()
}
