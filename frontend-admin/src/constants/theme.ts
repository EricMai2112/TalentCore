/**
 * Light Glassmorphism Design System Theme
 */
export const theme = {
  // Brand Primary
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: '#93C5FD',
  primarySoft: '#DBEAFE',

  // Accent Colors (Matching Background Radiants)
  violet: '#8B5CF6',
  cyan: '#06B6D4',
  teal: '#14B8A6',

  // Surface & Glass Levels
  glassLight: 'rgba(255, 255, 255, 0.42)',
  glassMedium: 'rgba(255, 255, 255, 0.55)',
  glassStrong: 'rgba(255, 255, 255, 0.72)',
  borderGlass: 'rgba(255, 255, 255, 0.65)',
  borderSubtle: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(15, 23, 42, 0.35)',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textDisabled: '#94A3B8',
  textOnAccent: '#FFFFFF',

  // Semantic States
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',
  errorSoft: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoSoft: 'rgba(59, 130, 246, 0.15)',

  // Preset Gradients
  gradientPrimary: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
  gradientSoft: 'linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 100%)',
  gradientBackground:
    'radial-gradient(circle at 12% 18%, rgba(139, 92, 246, 0.22), transparent 45%),' +
    'radial-gradient(circle at 88% 12%, rgba(6, 182, 212, 0.26), transparent 50%),' +
    'radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.18), transparent 55%),' +
    'linear-gradient(135deg, #C4DFEF 0%, #B8D9EC 40%, #8FC1E0 100%)',
} as const;

export const BRAND_COLORS = {
  primary: {
    DEFAULT: '#3B82F6',
    hover: '#1D4ED8',
    light: '#93C5FD',
  },
  background: {
    DEFAULT: '#C4DFEF',
    surface: '#ffffff',
  },
} as const;
