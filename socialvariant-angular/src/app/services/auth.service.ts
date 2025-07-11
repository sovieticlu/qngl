import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { AppStateService, User } from './app-state.service';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'sv_auth_token';
  private readonly USER_KEY = 'sv_user_data';
  
  // Signal-based reactive state
  private isAuthenticatedSignal = signal<boolean>(this.checkInitialAuthState());
  private currentUserSignal = signal<User | null>(this.getStoredUser());
  
  // Computed signals
  public isAuthenticated = computed(() => this.isAuthenticatedSignal());
  public currentUser = computed(() => this.currentUserSignal());
  public isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'admin' || false;
  });
  public isModerator = computed(() => {
    const user = this.currentUser();
    return user?.role === 'admin' || false; // Only admin for now
  });
  
  // BehaviorSubjects for observable compatibility
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private currentUserSubject = new BehaviorSubject<User | null>(this.currentUser());
  
  // Observables
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private appStateService: AppStateService
  ) {
    // Effect to update observables when signals change
    effect(() => {
      const isAuth = this.isAuthenticated();
      const user = this.currentUser();
      
      this.isAuthenticatedSubject.next(isAuth);
      this.currentUserSubject.next(user);
      
      // Update app state
      this.appStateService.setCurrentUser(user);
    });
  }

  /**
   * Check initial authentication state from localStorage
   */
  private checkInitialAuthState(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem(this.STORAGE_KEY);
    const user = this.getStoredUser();
    
    return !!(token && user);
  }

  /**
   * Get stored user data from localStorage
   */
  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Mock login method - replace with real API call
   */
  login(credentials: LoginCredentials): Observable<User> {
    this.appStateService.setLoading(true);
    
    // Mock authentication - replace with real API call
    return this.mockApiLogin(credentials).pipe(
      map((response: { user: User; token: string }) => {
        // Store token and user data
        localStorage.setItem(this.STORAGE_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        
        // Update signals
        this.isAuthenticatedSignal.set(true);
        this.currentUserSignal.set(response.user);
        
        this.notificationService.success(`Welcome back, ${response.user.name}!`);
        this.appStateService.setLoading(false);
        
        return response.user;
      }),
      catchError((error) => {
        this.appStateService.setLoading(false);
        this.notificationService.error(error.message || 'Login failed');
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock registration method - replace with real API call
   */
  register(registerData: RegisterData): Observable<User> {
    this.appStateService.setLoading(true);
    
    // Mock registration - replace with real API call
    return this.mockApiRegister(registerData).pipe(
      map((response: { user: User; token: string }) => {
        // Store token and user data
        localStorage.setItem(this.STORAGE_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        
        // Update signals
        this.isAuthenticatedSignal.set(true);
        this.currentUserSignal.set(response.user);
        
        this.notificationService.success(`Welcome to SocialVariant, ${response.user.name}!`);
        this.appStateService.setLoading(false);
        
        return response.user;
      }),
      catchError((error) => {
        this.appStateService.setLoading(false);
        this.notificationService.error(error.message || 'Registration failed');
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear stored data
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Update signals
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);
    
    // Redirect to login
    this.router.navigate(['/auth/login']);
    this.notificationService.info('You have been logged out');
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: 'admin' | 'user' | 'guest'): boolean {
    const user = this.currentUser();
    return user?.role === role || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: ('admin' | 'user' | 'guest')[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    
    return roles.includes(user.role);
  }

  /**
   * Mock API login - replace with real HTTP call
   */
  private mockApiLogin(credentials: LoginCredentials): Observable<{ user: User; token: string }> {
    return of(null).pipe(
      delay(1000), // Simulate network delay
      map(() => {
        // Mock validation
        if (credentials.email === 'admin@example.com' && credentials.password === 'admin') {
          return {
            user: {
              id: '1',
              email: 'admin@example.com',
              name: 'Admin User',
              avatar: '👨‍💼',
              role: 'admin' as const,
              lastActive: new Date()
            },
            token: 'mock-jwt-token-admin'
          };
        } else if (credentials.email === 'user@example.com' && credentials.password === 'user') {
          return {
            user: {
              id: '2',
              email: 'user@example.com',
              name: 'Regular User',
              avatar: '👤',
              role: 'user' as const,
              lastActive: new Date()
            },
            token: 'mock-jwt-token-user'
          };
        } else {
          throw new Error('Invalid email or password');
        }
      })
    );
  }

  /**
   * Mock API registration - replace with real HTTP call
   */
  private mockApiRegister(registerData: RegisterData): Observable<{ user: User; token: string }> {
    return of(null).pipe(
      delay(1000), // Simulate network delay
      map(() => {
        // Mock validation
        if (registerData.password !== registerData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (registerData.email === 'admin@example.com' || registerData.email === 'user@example.com') {
          throw new Error('Email already exists');
        }
        
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          email: registerData.email,
          name: registerData.name,
          avatar: '👤',
          role: 'user' as const,
          lastActive: new Date()
        };
        
        return {
          user: newUser,
          token: `mock-jwt-token-${newUser.id}`
        };
      })
    );
  }
}
