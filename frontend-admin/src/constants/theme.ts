/**
 * TalentCore Brand Palette Constants
 * Primary (Chủ đạo): #1261A6 (Header/Navbar, Primary CTA, Logo, Tiêu đề)
 * Secondary (Phụ): #126DA6 (Hover nút, Link, Footer, Sub-heading)
 * Accent (Nhấn): #2A95BF / #73C6D9 (Icon, Badge, Notification, Tag)
 * Background (Nền): #D5E7F2 (Nền section, Card background, Nền app)
 */

export const BRAND_COLORS = {
  primary: {
    DEFAULT: '#1261A6',
    hover: '#0e4e85',
    light: '#e8f2f9',
    rgb: '18, 97, 166',
  },
  secondary: {
    DEFAULT: '#126DA6',
    hover: '#0f5987',
    rgb: '18, 109, 166',
  },
  accent: {
    DEFAULT: '#2A95BF',
    hover: '#217a9e',
    light: '#73C6D9',
    lightBg: '#e6f4f8',
    rgb: '42, 149, 191',
  },
  background: {
    DEFAULT: '#D5E7F2',
    surface: '#ffffff',
  },
} as const;
