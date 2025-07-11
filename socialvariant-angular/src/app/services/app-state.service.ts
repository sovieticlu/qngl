import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, distinctUntilChanged, map, filter } from 'rxjs';

export interface AppState {
  isLoading: boolean;
  isOnline: boolean;
  currentUser: User | null;
  notifications: Notification[];
  theme: Theme;
  preferences: UserPreferences;
  navigation: NavigationState;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  lastActive: Date;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  autoClose?: boolean;
  duration?: number;
}

export interface Theme {
  name: string;
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

export interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  breadcrumbs: BreadcrumbItem[];
  isNavigating: boolean;
}

export interface BreadcrumbItem {
  label: string;
  route: string;
  icon?: string;
}

const initialState: AppState = {
  isLoading: false,
  isOnline: navigator.onLine,
  currentUser: null,
  notifications: [],
  theme: {
    name: 'SocialVariant Default',
    mode: 'light',
    primaryColor: '#007bff',
    accentColor: '#17a2b8'
  },
  preferences: {
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
      email: true,
      push: true,
      desktop: false
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium'
    }
  },
  navigation: {
    currentRoute: '/',
    previousRoute: null,
    breadcrumbs: [],
    isNavigating: false
  }
};

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private readonly stateSubject = new BehaviorSubject<AppState>(initialState);
  
  // Public state observable
  public readonly state$ = this.stateSubject.asObservable();
  
  // Specific state selectors
  public readonly isLoading$ = this.select(state => state.isLoading);
  public readonly isOnline$ = this.select(state => state.isOnline);
  public readonly currentUser$ = this.select(state => state.currentUser);
  public readonly notifications$ = this.select(state => state.notifications);
  public readonly unreadNotifications$ = this.select(state => 
    state.notifications.filter(n => !n.read)
  );
  public readonly theme$ = this.select(state => state.theme);
  public readonly preferences$ = this.select(state => state.preferences);
  public readonly navigation$ = this.select(state => state.navigation);

  constructor(private router: Router) {
    this.initializeStateFromStorage();
    this.setupOnlineStatusListener();
    this.setupStateSubscriptions();
    this.setupRouterSubscription();
  }

  /**
   * Get current state snapshot
   */
  getCurrentState(): AppState {
    return this.stateSubject.value;
  }

  /**
   * Select specific state slice with distinct until changed
   */
  private select<T>(selector: (state: AppState) => T): Observable<T> {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }

  /**
   * Update state immutably
   */
  private updateState(updates: Partial<AppState>): void {
    const currentState = this.getCurrentState();
    const newState = { ...currentState, ...updates };
    this.stateSubject.next(newState);
    this.saveStateToStorage(newState);
  }

  /**
   * Deep update nested state properties
   */
  private updateNestedState<K extends keyof AppState>(
    key: K,
    updates: Partial<AppState[K]>
  ): void {
    const currentState = this.getCurrentState();
    const currentValue = currentState[key];
    
    // Ensure we're working with an object
    if (currentValue && typeof currentValue === 'object') {
      const newState = {
        ...currentState,
        [key]: { ...currentValue as object, ...updates }
      };
      this.stateSubject.next(newState);
      this.saveStateToStorage(newState);
    }
  }

  // Loading state management
  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  // Online status management
  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => this.updateState({ isOnline: true }));
    window.addEventListener('offline', () => this.updateState({ isOnline: false }));
  }

  // User management
  setCurrentUser(user: User | null): void {
    this.updateState({ currentUser: user });
  }

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getCurrentState().currentUser;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setCurrentUser(updatedUser);
    }
  }

  // Notification management
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.getCurrentState().notifications;
    this.updateState({
      notifications: [...currentNotifications, newNotification]
    });

    // Auto-remove notification if specified
    if (newNotification.autoClose) {
      const duration = newNotification.duration || 5000;
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, duration);
    }
  }

  removeNotification(id: string): void {
    const currentNotifications = this.getCurrentState().notifications;
    this.updateState({
      notifications: currentNotifications.filter(n => n.id !== id)
    });
  }

  markNotificationAsRead(id: string): void {
    const currentNotifications = this.getCurrentState().notifications;
    this.updateState({
      notifications: currentNotifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    });
  }

  clearAllNotifications(): void {
    this.updateState({ notifications: [] });
  }

  // Theme management
  setTheme(theme: Partial<Theme>): void {
    this.updateNestedState('theme', theme);
    this.applyThemeToDOM(this.getCurrentState().theme);
  }

  private applyThemeToDOM(theme: Theme): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    
    // Apply theme mode
    document.body.classList.remove('light-theme', 'dark-theme');
    if (theme.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      document.body.classList.add(`${theme.mode}-theme`);
    }
  }

  // Preferences management
  setPreferences(preferences: Partial<UserPreferences>): void {
    this.updateNestedState('preferences', preferences);
  }

  updateNotificationPreferences(updates: Partial<UserPreferences['notifications']>): void {
    const currentPrefs = this.getCurrentState().preferences;
    this.setPreferences({
      notifications: { ...currentPrefs.notifications, ...updates }
    });
  }

  updateAccessibilityPreferences(updates: Partial<UserPreferences['accessibility']>): void {
    const currentPrefs = this.getCurrentState().preferences;
    this.setPreferences({
      accessibility: { ...currentPrefs.accessibility, ...updates }
    });
    this.applyAccessibilitySettings(currentPrefs.accessibility);
  }

  private applyAccessibilitySettings(accessibility: UserPreferences['accessibility']): void {
    const root = document.documentElement;
    
    // High contrast
    document.body.classList.toggle('high-contrast', accessibility.highContrast);
    
    // Reduced motion
    document.body.classList.toggle('reduced-motion', accessibility.reducedMotion);
    
    // Font size
    root.style.setProperty('--base-font-size', 
      accessibility.fontSize === 'small' ? '14px' :
      accessibility.fontSize === 'large' ? '18px' : '16px'
    );
  }

  // Navigation management
  private setupRouterSubscription(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.setCurrentRoute(event.urlAfterRedirects);
    });
  }

  setCurrentRoute(route: string, label?: string): void {
    const currentNav = this.getCurrentState().navigation;
    const newNav: NavigationState = {
      ...currentNav,
      previousRoute: currentNav.currentRoute,
      currentRoute: route
    };

    if (label) {
      // Update breadcrumbs
      const breadcrumbs = this.generateBreadcrumbs(route, label);
      newNav.breadcrumbs = breadcrumbs;
    }

    this.updateState({ navigation: newNav });
  }

  setNavigating(isNavigating: boolean): void {
    this.updateNestedState('navigation', { isNavigating });
  }

  updateNavigationState(navigation: Partial<NavigationState>): void {
    this.updateNestedState('navigation', navigation);
  }

  private generateBreadcrumbs(route: string, label: string): BreadcrumbItem[] {
    const segments = route.split('/').filter(s => s);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', route: '/', icon: 'home' }
    ];

    if (segments.length > 0 && route !== '/') {
      breadcrumbs.push({ label, route, icon: 'page' });
    }

    return breadcrumbs;
  }

  // State persistence
  private initializeStateFromStorage(): void {
    try {
      const savedState = localStorage.getItem('app-state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Only restore certain parts of state, not everything
        const restoredState: Partial<AppState> = {
          theme: parsedState.theme || initialState.theme,
          preferences: parsedState.preferences || initialState.preferences
        };
        this.updateState(restoredState);
      }
    } catch (error) {
      console.warn('Failed to restore state from localStorage:', error);
    }
  }

  private saveStateToStorage(state: AppState): void {
    try {
      // Only save certain parts of state
      const stateToSave = {
        theme: state.theme,
        preferences: state.preferences
      };
      localStorage.setItem('app-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }

  private setupStateSubscriptions(): void {
    // Apply initial theme
    this.theme$.subscribe(theme => {
      this.applyThemeToDOM(theme);
    });

    // Apply initial accessibility settings
    this.preferences$.subscribe(prefs => {
      this.applyAccessibilitySettings(prefs.accessibility);
    });
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // State reset
  resetState(): void {
    this.stateSubject.next(initialState);
    localStorage.removeItem('app-state');
  }

  // Debug methods (for development)
  logCurrentState(): void {
    console.log('Current App State:', this.getCurrentState());
  }
}
