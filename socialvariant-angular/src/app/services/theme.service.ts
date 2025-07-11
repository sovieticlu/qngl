import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, fromEvent, merge } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { AppStore } from '../store/app.store';
import { ThemeState } from '../store/app.state';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private mediaQuery: MediaQueryList | null = null;

  constructor(
    private store: AppStore,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.initializeThemeWatcher();
    this.loadPersistedTheme();
    
    // Apply initial theme to DOM
    setTimeout(() => {
      this.applyThemeToDOM(this.store.state.theme.isDarkMode);
    }, 0);
  }

  // Getters for reactive state
  get themeState$(): Observable<ThemeState> {
    return this.store.theme$;
  }

  get isDarkMode$(): Observable<boolean> {
    return this.store.isDarkMode$;
  }

  get currentTheme(): string {
    return this.store.state.theme.currentTheme;
  }

  get isDarkMode(): boolean {
    return this.store.state.theme.isDarkMode;
  }

  /**
   * Set the application theme
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.store.dispatch('SET_THEME', theme);
    this.applyThemeToDOM(this.calculateDarkMode(theme));
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    this.store.dispatch('TOGGLE_THEME');
    this.applyThemeToDOM(this.store.state.theme.isDarkMode);
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): any[] {
    return this.store.state.theme.themes;
  }

  /**
   * Get current theme information
   */
  getCurrentThemeInfo(): any {
    const state = this.store.state.theme;
    const theme = this.getThemeColors(state.isDarkMode);
    
    return {
      name: state.currentTheme,
      isDarkMode: state.isDarkMode,
      isSystemDarkMode: state.isSystemDarkMode,
      colors: theme.colors,
      classes: this.getThemeClasses()
    };
  }

  /**
   * Create theme-aware observable for components
   */
  createThemeObservable(): Observable<any> {
    return this.themeState$.pipe(
      map(themeState => ({
        theme: themeState.currentTheme,
        isDarkMode: themeState.isDarkMode,
        isSystemDarkMode: themeState.isSystemDarkMode,
        classes: this.getThemeClasses()
      })),
      distinctUntilChanged()
    );
  }

  /**
   * Initialize theme system watcher
   */
  private initializeThemeWatcher(): void {
    if (typeof window === 'undefined') {
      return; // Skip for SSR
    }

    try {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Set initial system preference
      this.store.dispatch('SET_SYSTEM_DARK_MODE', this.mediaQuery.matches);
      
      // Listen for changes in system preference
      const systemPreferenceChange$ = fromEvent(this.mediaQuery, 'change').pipe(
        map((event: any) => event.matches),
        startWith(this.mediaQuery.matches)
      );

      systemPreferenceChange$.subscribe(isDark => {
        this.store.dispatch('SET_SYSTEM_DARK_MODE', isDark);
        this.applyThemeToDOM(this.store.state.theme.isDarkMode);
      });
    } catch (error) {
      console.warn('Could not setup theme system watcher:', error);
    }
  }

  /**
   * Load persisted theme preference
   */
  private loadPersistedTheme(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const savedTheme = localStorage.getItem('sv_theme');
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        this.store.dispatch('SET_THEME', savedTheme);
      }
    } catch (error) {
      console.warn('Could not load persisted theme:', error);
    }
  }

  /**
   * Apply theme changes to DOM
   */
  private applyThemeToDOM(isDarkMode: boolean): void {
    if (typeof document === 'undefined') {
      return; // Skip for SSR
    }

    console.log('Applying theme to DOM:', isDarkMode ? 'dark' : 'light');
    const body = this.document.body;
    const theme = this.getThemeColors(isDarkMode);
    
    // Apply theme classes
    body.classList.toggle('dark-theme', isDarkMode);
    body.classList.toggle('light-theme', !isDarkMode);
    
    // Apply CSS custom properties
    const root = this.document.documentElement;
    Object.entries(theme.cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value as string);
      console.log(`Setting ${property} to ${value}`);
    });
  }

  /**
   * Calculate dark mode based on theme and system preference
   */
  private calculateDarkMode(theme: string): boolean {
    const systemDarkMode = this.store.state.theme.isSystemDarkMode;
    
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

  /**
   * Get theme colors based on dark mode state
   */
  private getThemeColors(isDarkMode: boolean): any {
    if (isDarkMode) {
      return {
        colors: {
          primary: '#4dabf7',
          secondary: '#6c757d',
          background: '#1a202c',
          surface: '#2d3748',
          text: '#f7fafc',
          textSecondary: '#e2e8f0',
          border: '#4a5568',
          accent: '#38b2ac'
        },
        cssVariables: {
          '--primary': '#4dabf7',
          '--primary-hover': '#339af0',
          '--primary-active': '#228be6',
          '--secondary': '#6c757d',
          '--background': '#1a202c',
          '--surface': '#2d3748',
          '--text': '#f7fafc',
          '--text-secondary': '#e2e8f0',
          '--border': '#4a5568',
          '--accent': '#38b2ac',
          '--success': '#48bb78',
          '--warning': '#ed8936',
          '--error': '#f56565',
          '--info': '#4299e1'
        }
      };
    } else {
      return {
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          background: '#ffffff',
          surface: '#f8f9fa',
          text: '#212529',
          textSecondary: '#6c757d',
          border: '#dee2e6',
          accent: '#17a2b8'
        },
        cssVariables: {
          '--primary': '#007bff',
          '--primary-hover': '#0069d9',
          '--primary-active': '#0062cc',
          '--secondary': '#6c757d',
          '--background': '#ffffff',
          '--surface': '#f8f9fa',
          '--text': '#212529',
          '--text-secondary': '#6c757d',
          '--border': '#dee2e6',
          '--accent': '#17a2b8',
          '--success': '#28a745',
          '--warning': '#ffc107',
          '--error': '#dc3545',
          '--info': '#17a2b8'
        }
      };
    }
  }

  /**
   * Get theme classes for components
   */
  private getThemeClasses(): string[] {
    const isDarkMode = this.store.state.theme.isDarkMode;
    const classes = ['theme'];
    
    if (isDarkMode) {
      classes.push('theme-dark');
    } else {
      classes.push('theme-light');
    }
    
    return classes;
  }
}
