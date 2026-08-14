/**
 * Centralized Environment Configuration for Candidate Portal (frontend-candidates)
 * Consolidates process.env readings with fallbacks.
 */
export const env = {
  /** Backend API Base URL */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",

  /** Realtime Socket.io Gateway URL */
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",

  /** Application Display Name */
  appName: process.env.NEXT_PUBLIC_APP_NAME || "TalentCore",

  /** Candidate Portal Public URL */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
} as const;
