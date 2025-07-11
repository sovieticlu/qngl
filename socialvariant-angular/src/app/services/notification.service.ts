import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppStateService, type Notification } from './app-state.service';

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  autoClose?: boolean;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor(private appStateService: AppStateService) {}

  /**
   * Get all notifications observable
   */
  get notifications$(): Observable<Notification[]> {
    return this.appStateService.notifications$;
  }

  /**
   * Get unread notifications observable
   */
  get unreadNotifications$(): Observable<Notification[]> {
    return this.appStateService.unreadNotifications$;
  }

  /**
   * Show a success notification
   */
  success(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'success' });
  }

  /**
   * Show an error notification
   */
  error(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'error', autoClose: false });
  }

  /**
   * Show a warning notification
   */
  warning(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'warning' });
  }

  /**
   * Show an info notification
   */
  info(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'info' });
  }

  /**
   * Show a notification with custom options
   */
  show(message: string, options: ToastOptions = {}): void {
    const notification = {
      type: options.type || 'info',
      title: options.title || this.getDefaultTitle(options.type || 'info'),
      message,
      read: false,
      autoClose: options.autoClose !== false, // Default to true
      duration: options.duration || this.getDefaultDuration(options.type || 'info')
    };

    this.appStateService.addNotification(notification);
  }

  /**
   * Remove a notification by ID
   */
  remove(id: string): void {
    this.appStateService.removeNotification(id);
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): void {
    this.appStateService.markNotificationAsRead(id);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.appStateService.clearAllNotifications();
  }

  /**
   * Show a loading notification that can be updated
   */
  showLoading(message: string = 'Loading...'): string {
    const notification = {
      type: 'info' as const,
      title: 'Loading',
      message,
      read: false,
      autoClose: false
    };

    this.appStateService.addNotification(notification);
    
    // Return the ID so it can be updated or removed later
    const notifications = this.appStateService.getCurrentState().notifications;
    return notifications[notifications.length - 1].id;
  }

  /**
   * Update a loading notification to success
   */
  updateLoadingToSuccess(id: string, message: string = 'Completed successfully!'): void {
    this.remove(id);
    this.success(message);
  }

  /**
   * Update a loading notification to error
   */
  updateLoadingToError(id: string, message: string = 'An error occurred'): void {
    this.remove(id);
    this.error(message);
  }

  /**
   * Show a confirmation-style notification (doesn't auto-close)
   */
  confirm(message: string, title: string = 'Confirmation'): void {
    this.show(message, {
      type: 'warning',
      title,
      autoClose: false
    });
  }

  /**
   * Batch add multiple notifications
   */
  showMultiple(notifications: Array<{ message: string; options?: ToastOptions }>): void {
    notifications.forEach(({ message, options }) => {
      this.show(message, options);
    });
  }

  /**
   * Show system notifications (browser notifications)
   */
  async showSystemNotification(title: string, message: string, icon?: string): Promise<void> {
    // Check if user preferences allow desktop notifications
    const preferences = this.appStateService.getCurrentState().preferences;
    if (!preferences.notifications.desktop) {
      return;
    }

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'socialvariant-notification'
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }

  /**
   * Get default title based on notification type
   */
  private getDefaultTitle(type: 'success' | 'error' | 'warning' | 'info'): string {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    };
    return titles[type];
  }

  /**
   * Get default duration based on notification type
   */
  private getDefaultDuration(type: 'success' | 'error' | 'warning' | 'info'): number {
    const durations = {
      success: 4000,
      error: 0, // Don't auto-close errors
      warning: 6000,
      info: 5000
    };
    return durations[type];
  }

  /**
   * Handle application-level notifications
   */
  handleAppEvent(event: 'user-login' | 'user-logout' | 'theme-changed' | 'preferences-saved' | 'error' | 'offline' | 'online'): void {
    const eventMessages = {
      'user-login': { message: 'Welcome back!', type: 'success' as const },
      'user-logout': { message: 'You have been logged out', type: 'info' as const },
      'theme-changed': { message: 'Theme updated successfully', type: 'success' as const },
      'preferences-saved': { message: 'Preferences saved', type: 'success' as const },
      'error': { message: 'An unexpected error occurred', type: 'error' as const },
      'offline': { message: 'You are currently offline', type: 'warning' as const, autoClose: false },
      'online': { message: 'Connection restored', type: 'success' as const }
    };

    const eventConfig = eventMessages[event];
    if (eventConfig) {
      this.show(eventConfig.message, eventConfig);
    }
  }
}
