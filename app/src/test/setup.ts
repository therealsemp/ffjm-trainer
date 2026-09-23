import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// React Testing Library's auto-cleanup only self-registers when `afterEach`
// exists on the global scope, which requires `test.globals: true` — this
// project keeps explicit imports instead, so register it by hand.
afterEach(() => {
  cleanup()
})

// jsdom doesn't implement <dialog>'s imperative API (showModal/close) —
// ZoomableImage relies on it, so polyfill just enough (toggle the `open`
// attribute, fire a `close` event) for component tests to exercise it.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
