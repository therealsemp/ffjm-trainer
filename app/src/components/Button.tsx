import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Link } from "react-router-dom"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger"
  // When set, renders as a navigation link (react-router) styled like a
  // button, instead of a <button> — for "go to this screen" actions.
  to?: string
  children?: ReactNode
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-blue text-white",
  danger: "bg-brand-danger text-white",
}

export function Button({ variant = "primary", className = "", to, children, ...props }: ButtonProps) {
  const classes = `self-start rounded-lg px-5 py-2.5 font-semibold cursor-pointer hover:opacity-90 ${VARIANT_CLASSES[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
