/**
 * Centralized Environment Configuration for Admin Portal (frontend-admin)
 * Consolidates process.env readings with fallbacks.
 */
export const env = {
  /** Backend API Base URL */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",

  /** Admin Portal Application Name */
  appName: process.env.NEXT_PUBLIC_APP_NAME || "TalentCore Admin",

  /** Admin Portal Base URL */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;
