import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { AppState, ThemeState, LanguageState, PWAState, UIState } from './app.state';

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  private readonly initialState: AppState = {
    theme: {
      currentTheme: 'auto',
      isDarkMode: false,
      isSystemDarkMode: this.getSystemDarkMode(),
      themes: this.getDefaultThemes()
    },
    language: {
      currentLanguage: this.getBrowserLanguage(),
      availableLanguages: this.getDefaultLanguages(),
      isLoading: false,
      translations: {}
    },
    pwa: {
      isInstallable: false,
      isInstalled: this.isAppInstalled(),
      isOnline: navigator.onLine,
      updateAvailable: false,
      isLoading: false,
      installPrompt: null,
      swUpdate: null
    },
    ui: {
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      loading: false,
      notifications: []
    }
  };

  private state$ = new BehaviorSubject<AppState>(this.initialState);

  // State selectors
  get state(): AppState {
    return this.state$.value;
  }

  get theme$(): Observable<ThemeState> {
    return this.state$.pipe(
      map(state => state.theme),
      distinctUntilChanged()
    );
  }

  get language$(): Observable<LanguageState> {
    return this.state$.pipe(
      map(state => state.language),
      distinctUntilChanged()
    );
  }

  get pwa$(): Observable<PWAState> {
    return this.state$.pipe(
      map(state => state.pwa),
      distinctUntilChanged()
    );
  }

  get ui$(): Observable<UIState> {
    return this.state$.pipe(
      map(state => state.ui),
      distinctUntilChanged()
    );
  }

  // Specific selectors
  get isDarkMode$(): Observable<boolean> {
    return this.theme$.pipe(
      map(theme => theme.isDarkMode),
      distinctUntilChanged()
    );
  }

  get currentLanguage$(): Observable<string> {
    return this.language$.pipe(
      map(language => language.currentLanguage),
      distinctUntilChanged()
    );
  }

  get isOnline$(): Observable<boolean> {
    return this.pwa$.pipe(
      map(pwa => pwa.isOnline),
      distinctUntilChanged()
    );
  }

  // Action dispatcher
  dispatch(action: string, payload?: any): void {
    const currentState = this.state$.value;
    const newState = this.reducer(currentState, { type: action, payload });
    this.state$.next(newState);
    
    // Persist certain state changes
    this.persistState(action, payload);
  }

  private reducer(state: AppState, action: { type: string; payload?: any }): AppState {
    switch (action.type) {
      // Theme actions
      case 'SET_THEME':
        console.log('Store: Setting theme to', action.payload);
        return {
          ...state,
          theme: {
            ...state.theme,
            currentTheme: action.payload,
            isDarkMode: this.calculateDarkMode(action.payload, state.theme.isSystemDarkMode)
          }
        };

      case 'SET_SYSTEM_DARK_MODE':
        return {
          ...state,
          theme: {
            ...state.theme,
            isSystemDarkMode: action.payload,
            isDarkMode: this.calculateDarkMode(state.theme.currentTheme, action.payload)
          }
        };

      case 'TOGGLE_THEME':
        const newTheme = state.theme.currentTheme === 'light' ? 'dark' : 'light';
        return {
          ...state,
          theme: {
            ...state.theme,
            currentTheme: newTheme,
            isDarkMode: newTheme === 'dark'
          }
        };

      // Language actions
      case 'SET_LANGUAGE':
        return {
          ...state,
          language: {
            ...state.language,
            currentLanguage: action.payload
          }
        };

      case 'SET_TRANSLATIONS':
        return {
          ...state,
          language: {
            ...state.language,
            translations: { ...state.language.translations, ...action.payload }
          }
        };

      case 'SET_LANGUAGE_LOADING':
        return {
          ...state,
          language: {
            ...state.language,
            isLoading: action.payload
          }
        };

      // PWA actions
      case 'SET_INSTALLABLE':
        return {
          ...state,
          pwa: {
            ...state.pwa,
            isInstallable: action.payload
          }
        };

      case 'SET_INSTALLED':
        return {
          ...state,
          pwa: {
            ...state.pwa,
            isInstalled: action.payload
          }
        };

      case 'SET_ONLINE_STATUS':
        return {
          ...state,
          pwa: {
            ...state.pwa,
            isOnline: action.payload
          }
        };

      case 'SET_UPDATE_AVAILABLE':
        return {
          ...state,
          pwa: {
            ...state.pwa,
            updateAvailable: action.payload
          }
        };

      case 'SET_INSTALL_PROMPT':
        return {
          ...state,
          pwa: {
            ...state.pwa,
            installPrompt: action.payload
          }
        };

      // UI actions
      case 'SET_SIDEBAR_COLLAPSED':
        return {
          ...state,
          ui: {
            ...state.ui,
            sidebarCollapsed: action.payload
          }
        };

      case 'SET_MOBILE_SIDEBAR_OPEN':
        return {
          ...state,
          ui: {
            ...state.ui,
            mobileSidebarOpen: action.payload
          }
        };

      case 'SET_LOADING':
        return {
          ...state,
          ui: {
            ...state.ui,
            loading: action.payload
          }
        };

      case 'ADD_NOTIFICATION':
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, action.payload]
          }
        };

      case 'REMOVE_NOTIFICATION':
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter(n => n.id !== action.payload)
          }
        };

      case 'CLEAR_NOTIFICATIONS':
        return {
          ...state,
          ui: {
            ...state.ui,
            notifications: []
          }
        };

      default:
        return state;
    }
  }

  private calculateDarkMode(theme: string, systemDarkMode: boolean): boolean {
    switch (theme) {
      case 'light':
        return false;
      case 'dark':
        return true;
      case 'auto':
        return systemDarkMode;
      default:
        return systemDarkMode;
    }
  }

  private persistState(action: string, payload?: any): void {
    try {
      switch (action) {
        case 'SET_THEME':
          localStorage.setItem('sv_theme', payload);
          break;
        case 'SET_LANGUAGE':
          localStorage.setItem('sv_language', payload);
          break;
        case 'SET_SIDEBAR_COLLAPSED':
          localStorage.setItem('sv_sidebar_collapsed', JSON.stringify(payload));
          break;
      }
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }

  private getSystemDarkMode(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private getBrowserLanguage(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sv_language');
      if (stored) return stored;
      
      return navigator.language.split('-')[0] || 'en';
    }
    return 'en';
  }

  private isAppInstalled(): boolean {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone === true;
    }
    return false;
  }

  private getDefaultThemes(): any[] {
    return [
      {
        id: 'light',
        name: 'light',
        displayName: 'Light',
        isDark: false,
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          background: '#ffffff',
          surface: '#f8f9fa',
          text: '#212529',
          textSecondary: '#6c757d',
          border: '#dee2e6',
          accent: '#17a2b8'
        }
      },
      {
        id: 'dark',
        name: 'dark',
        displayName: 'Dark',
        isDark: true,
        colors: {
          primary: '#0d6efd',
          secondary: '#6c757d',
          background: '#1a202c',
          surface: '#2d3748',
          text: '#f7fafc',
          textSecondary: '#e2e8f0',
          border: '#4a5568',
          accent: '#38b2ac'
        }
      }
    ];
  }

  private getDefaultLanguages(): any[] {
    return [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        isRTL: false
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        isRTL: false
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        isRTL: false
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        isRTL: false
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        isRTL: true
      }
    ];
  }
}
