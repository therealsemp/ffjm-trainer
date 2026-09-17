import { createCanvas, loadImage } from "@napi-rs/canvas"
import { writeFileSync } from "node:fs"
const [,, src, x, y, w, h, out] = process.argv
const img = await loadImage(src)
const c = createCanvas(Number(w), Number(h))
c.getContext("2d").drawImage(img, Number(x), Number(y), Number(w), Number(h), 0, 0, Number(w), Number(h))
writeFileSync(out, c.toBuffer("image/png"))
console.log(`subcrop [${x},${y},${w},${h}] from ${src} -> ${out}`)
