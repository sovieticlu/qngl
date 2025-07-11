// Application State Interface
export interface AppState {
  theme: ThemeState;
  language: LanguageState;
  pwa: PWAState;
  ui: UIState;
}

// Theme State
export interface ThemeState {
  currentTheme: 'light' | 'dark' | 'auto';
  isDarkMode: boolean;
  isSystemDarkMode: boolean;
  themes: Theme[];
}

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  isDark: boolean;
  colors: ThemeColors;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
}

// Language State
export interface LanguageState {
  currentLanguage: string;
  availableLanguages: Language[];
  isLoading: boolean;
  translations: { [key: string]: any };
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

// PWA State
export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  isLoading: boolean;
  installPrompt: any;
  swUpdate: any;
}

// UI State
export interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  loading: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}
