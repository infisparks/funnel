export type AccentColor = {
  id: string;
  name: string;
  primary: string;
  hover: string;
  light: string;
  dark: string;
  border: string;
  ring: string;
};

export type SidebarStyle = 'standard' | 'dual-column' | 'compact';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  sidebarStyle: SidebarStyle;
  setSidebarStyle: (style: SidebarStyle) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  children?: NavItem[];
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
}
