import type { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

// The one button style the app has needed so far. Add a `variant` prop
// here if/when a second style shows up — don't restyle a raw <button> in a
// page instead of extending this.
export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`self-start rounded-lg bg-brand-blue px-5 py-2.5 font-semibold text-white cursor-pointer hover:opacity-90 ${className}`}
      {...props}
    />
  )
}
