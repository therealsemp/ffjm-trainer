import type { ReactNode } from "react"

interface SelectableCardProps {
  name: string
  value: string
  checked: boolean
  onChange: () => void
  children: ReactNode
}

// A radio option styled as a card instead of a native radio button. The
// input stays in the DOM (keyboard nav, screen readers, form semantics),
// visually hidden behind the card — see `.sr-only` usage below.
export function SelectableCard({ name, value, checked, onChange, children }: SelectableCardProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-2.5 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-blue has-[:focus-visible]:outline-offset-2 ${
        checked
          ? "border-brand-gold bg-brand-gold/15"
          : "border-brand-line bg-brand-surface hover:-translate-y-0.5 hover:border-brand-blue/50 hover:bg-brand-blue/5 hover:shadow-md"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {children}
    </label>
  )
}
