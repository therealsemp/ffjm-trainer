import { useRef } from "react"
import { createPortal } from "react-dom"

interface ZoomableImageProps {
  src?: string
  alt?: string
}

// The single `img` renderer RichContent hands every image to (statement,
// answer, correction) — one change here covers both training mode and
// archive consultation, since both funnel through RichContent. Tapping the
// thumbnail opens it in a dialog whose own width (92vw, capped at 720px) is
// what the image is forced to fill — not its native pixel size — so a tiny
// source scan is deliberately upscaled rather than just "not shrunk",
// trading sharpness for legibility on a diagram.
//
// The dialog is portaled to `document.body`: a lone image in markdown is
// wrapped in a `<p>` by react-markdown, and `<dialog>` isn't valid phrasing
// content there (invalid nesting, browsers/React warn and mishandle it) —
// rendering it outside that `<p>` in the DOM, while staying a normal React
// child for props/state, avoids the nesting problem entirely.
export function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  if (!src) return null

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="cursor-zoom-in border-0 bg-transparent p-0"
      >
        <img src={src} alt={alt ?? ""} />
      </button>
      {createPortal(
        <dialog
          ref={dialogRef}
          onClick={() => dialogRef.current?.close()}
          className="m-auto w-[92vw] max-w-[720px] border-0 bg-transparent p-0 backdrop:bg-black/80"
        >
          <img src={src} alt={alt ?? ""} className="block w-full cursor-zoom-out" />
        </dialog>,
        document.body,
      )}
    </>
  )
}
