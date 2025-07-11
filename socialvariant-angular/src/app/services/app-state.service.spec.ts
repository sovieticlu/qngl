import { TestBed } from '@angular/core/testing';
import { AppStateService, AppState, User, Notification, Theme, UserPreferences, NavigationState } from './app-state.service';

describe('AppStateService', () => {
  let service: AppStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppStateService);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      service.setLoading(true);
      
      service.isLoading$.subscribe(isLoading => {
        expect(isLoading).toBe(true);
      });
    });

    it('should update loading state', () => {
      service.setLoading(true);
      service.setLoading(false);
      
      service.isLoading$.subscribe(isLoading => {
        expect(isLoading).toBe(false);
      });
    });
  });

  describe('User Management', () => {
    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      lastActive: new Date()
    };

    it('should set current user', () => {
      service.setCurrentUser(mockUser);
      
      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should update user properties', () => {
      service.setCurrentUser(mockUser);
      service.updateUser({ name: 'Updated Name' });
      
      service.currentUser$.subscribe(user => {
        expect(user?.name).toBe('Updated Name');
        expect(user?.email).toBe(mockUser.email);
      });
    });

    it('should handle null user update gracefully', () => {
      service.updateUser({ name: 'Test' });
      
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('Notification Management', () => {
    it('should add notification', () => {
      const notification = {
        type: 'success' as const,
        title: 'Test',
        message: 'Test message',
        read: false
      };

      service.addNotification(notification);

      service.notifications$.subscribe(notifications => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('success');
        expect(notifications[0].title).toBe('Test');
        expect(notifications[0].message).toBe('Test message');
        expect(notifications[0].read).toBe(false);
        expect(notifications[0].id).toBeDefined();
        expect(notifications[0].timestamp).toBeInstanceOf(Date);
      });
    });

    it('should remove notification', () => {
      const notification = {
        type: 'info' as const,
        title: 'Test',
        message: 'Test message',
        read: false
      };

      service.addNotification(notification);
      
      let notificationId: string;
      service.notifications$.subscribe(notifications => {
        if (notifications.length > 0) {
          notificationId = notifications[0].id;
        }
      });

      service.removeNotification(notificationId!);

      service.notifications$.subscribe(notifications => {
        expect(notifications.length).toBe(0);
      });
    });

    it('should mark notification as read', () => {
      const notification = {
        type: 'warning' as const,
        title: 'Test',
        message: 'Test message',
        read: false
      };

      service.addNotification(notification);
      
      let notificationId: string;
      service.notifications$.subscribe(notifications => {
        if (notifications.length > 0) {
          notificationId = notifications[0].id;
        }
      });

      service.markNotificationAsRead(notificationId!);

      service.notifications$.subscribe(notifications => {
        expect(notifications[0].read).toBe(true);
      });
    });

    it('should clear all notifications', () => {
      service.addNotification({ type: 'success', title: 'Test 1', message: 'Message 1', read: false });
      service.addNotification({ type: 'error', title: 'Test 2', message: 'Message 2', read: false });

      service.clearAllNotifications();

      service.notifications$.subscribe(notifications => {
        expect(notifications.length).toBe(0);
      });
    });

    it('should filter unread notifications', () => {
      service.addNotification({ type: 'success', title: 'Test 1', message: 'Message 1', read: false });
      service.addNotification({ type: 'info', title: 'Test 2', message: 'Message 2', read: false });

      let firstNotificationId: string;
      service.notifications$.subscribe(notifications => {
        if (notifications.length >= 1) {
          firstNotificationId = notifications[0].id;
        }
      });

      service.markNotificationAsRead(firstNotificationId!);

      service.unreadNotifications$.subscribe(unreadNotifications => {
        expect(unreadNotifications.length).toBe(1);
        expect(unreadNotifications[0].title).toBe('Test 2');
      });
    });
  });

  describe('Theme Management', () => {
    it('should set theme properties', () => {
      const newTheme: Partial<Theme> = {
        mode: 'dark',
        primaryColor: '#ff0000'
      };

      service.setTheme(newTheme);

      service.theme$.subscribe(theme => {
        expect(theme.mode).toBe('dark');
        expect(theme.primaryColor).toBe('#ff0000');
      });
    });

    it('should apply theme to DOM', () => {
      const newTheme: Partial<Theme> = {
        primaryColor: '#123456',
        accentColor: '#654321'
      };

      service.setTheme(newTheme);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--primary-color')).toBe('#123456');
      expect(root.style.getPropertyValue('--accent-color')).toBe('#654321');
    });
  });

  describe('Preferences Management', () => {
    it('should update notification preferences', () => {
      const newPrefs = { email: false, push: true };
      
      service.updateNotificationPreferences(newPrefs);

      service.preferences$.subscribe(prefs => {
        expect(prefs.notifications.email).toBe(false);
        expect(prefs.notifications.push).toBe(true);
        expect(prefs.notifications.desktop).toBe(false); // Should maintain existing value
      });
    });

    it('should update accessibility preferences', () => {
      const newAccessibility = { highContrast: true, fontSize: 'large' as const };
      
      service.updateAccessibilityPreferences(newAccessibility);

      service.preferences$.subscribe(prefs => {
        expect(prefs.accessibility.highContrast).toBe(true);
        expect(prefs.accessibility.fontSize).toBe('large');
        expect(prefs.accessibility.reducedMotion).toBe(false); // Should maintain existing value
      });
    });
  });

  describe('Navigation Management', () => {
    it('should set current route', () => {
      service.setCurrentRoute('/test', 'Test Page');

      service.navigation$.subscribe(nav => {
        expect(nav.currentRoute).toBe('/test');
        expect(nav.previousRoute).toBe('/'); // Initial route
      });
    });

    it('should set navigation loading state', () => {
      service.setNavigating(true);

      service.navigation$.subscribe(nav => {
        expect(nav.isNavigating).toBe(true);
      });
    });

    it('should generate breadcrumbs for simple route', () => {
      service.setCurrentRoute('/test', 'Test Page');

      service.navigation$.subscribe(nav => {
        expect(nav.breadcrumbs.length).toBe(2);
        expect(nav.breadcrumbs[0]).toEqual({ label: 'Home', route: '/', icon: 'home' });
        expect(nav.breadcrumbs[1]).toEqual({ label: 'Test Page', route: '/test', icon: 'page' });
      });
    });

    it('should generate breadcrumbs for home route', () => {
      service.setCurrentRoute('/', 'Home');

      service.navigation$.subscribe(nav => {
        expect(nav.breadcrumbs.length).toBe(1);
        expect(nav.breadcrumbs[0]).toEqual({ label: 'Home', route: '/', icon: 'home' });
      });
    });
  });

  describe('State Persistence', () => {
    it('should save state to localStorage', () => {
      const newTheme: Partial<Theme> = { primaryColor: '#ff0000' };
      service.setTheme(newTheme);

      const savedState = localStorage.getItem('app-state');
      expect(savedState).toBeTruthy();
      
      const parsedState = JSON.parse(savedState!);
      expect(parsedState.theme.primaryColor).toBe('#ff0000');
    });

    it('should restore state from localStorage', () => {
      const stateToSave = {
        theme: { name: 'Test Theme', mode: 'dark', primaryColor: '#123456', accentColor: '#654321' },
        preferences: { language: 'es', timezone: 'UTC' }
      };
      
      localStorage.setItem('app-state', JSON.stringify(stateToSave));

      // Create new service instance to test restoration
      const newService = new AppStateService();

      newService.theme$.subscribe(theme => {
        expect(theme.name).toBe('Test Theme');
        expect(theme.mode).toBe('dark');
        expect(theme.primaryColor).toBe('#123456');
      });

      newService.preferences$.subscribe(prefs => {
        expect(prefs.language).toBe('es');
        expect(prefs.timezone).toBe('UTC');
      });
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('app-state', 'invalid json');
      
      // Should not throw error
      const newService = new AppStateService();
      expect(newService).toBeTruthy();
    });
  });

  describe('State Reset', () => {
    it('should reset state to initial values', () => {
      // Modify state
      service.setLoading(true);
      service.setCurrentUser({ id: '1', name: 'Test', email: 'test@test.com', role: 'user', lastActive: new Date() });
      service.addNotification({ type: 'success', title: 'Test', message: 'Test', read: false });

      // Reset state
      service.resetState();

      service.isLoading$.subscribe(loading => expect(loading).toBe(false));
      service.currentUser$.subscribe(user => expect(user).toBeNull());
      service.notifications$.subscribe(notifications => expect(notifications.length).toBe(0));
    });

    it('should clear localStorage on reset', () => {
      service.setTheme({ primaryColor: '#123456' });
      expect(localStorage.getItem('app-state')).toBeTruthy();

      service.resetState();
      expect(localStorage.getItem('app-state')).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    it('should get current state snapshot', () => {
      service.setLoading(true);
      const currentState = service.getCurrentState();
      
      expect(currentState.isLoading).toBe(true);
    });

    it('should log current state', () => {
      const consoleSpy = spyOn(console, 'log');
      service.logCurrentState();
      
      expect(consoleSpy).toHaveBeenCalledWith('Current App State:', jasmine.any(Object));
    });
  });
});
