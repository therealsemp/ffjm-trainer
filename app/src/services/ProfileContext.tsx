// React wiring around profileService — the equivalent of injecting a
// service in Ember. Components never call profileService or storage
// directly, only useProfile().

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { profileService } from "./profileService"
import type { Profile } from "../types/profile"

interface ProfileContextValue {
  profile: Profile | null
  createProfile: (profile: Profile) => void
  resetProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => profileService.getActiveProfile())

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      createProfile: (newProfile: Profile) => {
        profileService.createProfile(newProfile)
        setProfile(newProfile)
      },
      resetProfile: () => {
        profileService.resetProfile()
        setProfile(null)
      },
    }),
    [profile],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
