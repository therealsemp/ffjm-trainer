// Story 1.2 — profile creation.

import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useProfile } from "../services/ProfileContext"
import { CATEGORY_OPTIONS, type CategoryCode } from "../types/profile"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"
import { SelectableCard } from "../components/SelectableCard"

export function ProfileCreationPage() {
  const { createProfile } = useProfile()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [category, setCategory] = useState<CategoryCode | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmedName = name.trim()
    const hasNameError = trimmedName.length === 0
    const hasCategoryError = category === null

    setNameError(hasNameError ? "Indique un prénom pour continuer." : null)
    setCategoryError(hasCategoryError ? "Choisis une catégorie pour continuer." : null)

    if (hasNameError || hasCategoryError) return

    createProfile({ name: trimmedName, category: category! })
    navigate("/accueil", { replace: true })
  }

  return (
    <PageContainer gap="gap-4">
      <h1 className="text-3xl font-bold">Crée ton profil</h1>
      <p className="text-brand-muted">
        Indique ton prénom et ta catégorie FFJM pour commencer à t'entraîner.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <label htmlFor="profile-name" className="font-semibold">
            Prénom
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
            className="rounded-lg border border-brand-line bg-brand-surface px-3 py-2.5 text-inherit"
          />
          {nameError && <p className="text-sm text-brand-danger">{nameError}</p>}
        </div>

        <fieldset className="flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2 p-0 font-semibold">Catégorie</legend>
          <div className="flex flex-col gap-2.5">
            {CATEGORY_OPTIONS.map((option) => (
              <SelectableCard
                key={option.code}
                name="category"
                value={option.code}
                checked={category === option.code}
                onChange={() => setCategory(option.code)}
              >
                <span className="flex flex-col">
                  <span className="font-heading text-lg font-bold">{option.code}</span>
                  <span className="text-sm text-brand-muted">
                    {option.label} : {option.description}
                  </span>
                </span>
              </SelectableCard>
            ))}
          </div>
          {categoryError && <p className="text-sm text-brand-danger">{categoryError}</p>}
        </fieldset>

        <Button type="submit">Commencer</Button>
      </form>
    </PageContainer>
  )
}
