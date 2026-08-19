"use client";

/**
 * ActiveProfileContext
 *
 * Provides the active profile ID to all edit modals so they can call
 * profileApi.updateProfileById(profileId, payload) instead of the legacy
 * profileApi.updateProfile() which always targets the default profile.
 *
 * If profileId is null (legacy /user/profile page), modals fall back to
 * the old behaviour.
 */

import { createContext, useContext } from "react";
import { profileApi } from "../services/user.api";
import { CandidateProfile } from "../types/profile.types";

interface ActiveProfileContextType {
  /**
   * Save a partial update to the currently active profile.
   * Automatically routes to updateProfileById or updateProfile
   * depending on whether a profileId is set.
   */
  saveProfile: (payload: Partial<CandidateProfile>) => Promise<any>;
}

const ActiveProfileContext = createContext<ActiveProfileContextType>({
  saveProfile: (payload) => profileApi.updateProfile(payload),
});

export function ActiveProfileProvider({
  profileId,
  children,
}: {
  profileId?: string;
  children: React.ReactNode;
}) {
  const saveProfile = async (payload: Partial<CandidateProfile>) => {
    if (profileId) {
      return profileApi.updateProfileById(profileId, payload);
    }
    return profileApi.updateProfile(payload);
  };

  return (
    <ActiveProfileContext.Provider value={{ saveProfile }}>
      {children}
    </ActiveProfileContext.Provider>
  );
}

export const useActiveProfile = () => useContext(ActiveProfileContext);
