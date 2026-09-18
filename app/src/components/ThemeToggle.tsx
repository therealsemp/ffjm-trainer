import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react"
import { useTheme } from "../services/ThemeContext"
import type { ThemePreference } from "../types/theme"

const OPTIONS: { value: ThemePreference; label: string; Icon: LucideIcon }[] = [
  { value: "light", label: "Clair", Icon: Sun },
  { value: "dark", label: "Sombre", Icon: Moon },
  { value: "system", label: "Système", Icon: Monitor },
]

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()

  return (
    <div className="flex w-fit gap-1 self-start rounded-full border border-brand-line bg-brand-surface p-1">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPreference(value)}
          aria-label={`Thème ${label.toLowerCase()}`}
          aria-pressed={preference === value}
          className={`cursor-pointer rounded-full p-1.5 transition-colors ${
            preference === value ? "bg-brand-blue text-white" : "text-brand-muted hover:text-brand-text"
          }`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  )
}
