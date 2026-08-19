"use client";


import { createContext, useContext } from "react";
import { profileApi } from "../services/user.api";
import { CandidateProfile } from "../types/profile.types";

interface ActiveProfileContextType {
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
