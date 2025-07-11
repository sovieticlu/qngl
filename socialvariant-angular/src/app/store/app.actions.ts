// Theme Actions
export interface ThemeActions {
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleTheme: () => void;
  setSystemDarkMode: (isDark: boolean) => void;
  loadThemes: () => void;
  applyCustomTheme: (theme: any) => void;
}

// Language Actions
export interface LanguageActions {
  setLanguage: (languageCode: string) => void;
  loadLanguages: () => void;
  loadTranslations: (languageCode: string) => void;
  setTranslations: (translations: any) => void;
}

// PWA Actions
export interface PWAActions {
  setInstallable: (installable: boolean) => void;
  setInstalled: (installed: boolean) => void;
  setOnlineStatus: (online: boolean) => void;
  setUpdateAvailable: (available: boolean) => void;
  installApp: () => void;
  updateApp: () => void;
  setInstallPrompt: (prompt: any) => void;
}

// UI Actions
export interface UIActions {
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Combined Actions Interface
export interface AppActions extends ThemeActions, LanguageActions, PWAActions, UIActions {
}
