import type { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger"
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-blue text-white",
  danger: "bg-brand-danger text-white",
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`self-start rounded-lg px-5 py-2.5 font-semibold cursor-pointer hover:opacity-90 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
