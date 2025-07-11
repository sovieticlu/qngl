import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { AppStore } from '../store/app.store';
import { PWAState } from '../store/app.state';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PWAService {
  private deferredPrompt: any;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor(
    private store: AppStore,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.initializePWA();
  }

  // Getters for reactive state
  get pwaState$(): Observable<PWAState> {
    return this.store.pwa$;
  }

  get isInstallable$(): Observable<boolean> {
    return this.pwaState$.pipe(
      map(state => state.isInstallable)
    );
  }

  get isInstalled$(): Observable<boolean> {
    return this.pwaState$.pipe(
      map(state => state.isInstalled)
    );
  }

  get isOnline$(): Observable<boolean> {
    return this.store.isOnline$;
  }

  get updateAvailable$(): Observable<boolean> {
    return this.pwaState$.pipe(
      map(state => state.updateAvailable)
    );
  }

  get isInstallable(): boolean {
    return this.store.state.pwa.isInstallable;
  }

  get isInstalled(): boolean {
    return this.store.state.pwa.isInstalled;
  }

  get isOnline(): boolean {
    return this.store.state.pwa.isOnline;
  }

  get updateAvailable(): boolean {
    return this.store.state.pwa.updateAvailable;
  }

  /**
   * Install the PWA
   */
  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('PWA install prompt is not available');
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      // Update state based on user choice
      if (outcome === 'accepted') {
        this.store.dispatch('SET_INSTALLED', true);
        this.store.dispatch('SET_INSTALLABLE', false);
        console.log('PWA installation accepted');
        return true;
      } else {
        console.log('PWA installation dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    } finally {
      // Clear the deferredPrompt
      this.deferredPrompt = null;
      this.store.dispatch('SET_INSTALL_PROMPT', null);
    }
  }

  /**
   * Update the PWA (reload with new service worker)
   */
  async updateApp(): Promise<boolean> {
    if (!this.swRegistration) {
      console.warn('Service worker registration not available');
      return false;
    }

    try {
      // Check for updates
      await this.swRegistration.update();
      
      // If there's a waiting service worker, skip waiting and reload
      if (this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Listen for the controlling change and reload
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating PWA:', error);
      return false;
    }
  }

  /**
   * Check if the app is running in standalone mode
   */
  isRunningStandalone(): boolean {
    // Check for iOS standalone mode
    if (window.navigator.standalone) {
      return true;
    }

    // Check for Android standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check for other PWA indicators
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return true;
    }

    return false;
  }

  /**
   * Check if the device/browser supports PWA installation
   */
  canInstall(): boolean {
    // Check if it's a supported browser and platform
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    
    // Check if already installed
    const isAlreadyInstalled = this.isRunningStandalone();
    
    return isSupported && !isAlreadyInstalled && this.isInstallable;
  }

  /**
   * Get PWA capabilities
   */
  getCapabilities(): {
    serviceWorker: boolean;
    pushNotifications: boolean;
    backgroundSync: boolean;
    periodicBackgroundSync: boolean;
    webShare: boolean;
    badging: boolean;
  } {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      periodicBackgroundSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
      webShare: 'share' in navigator,
      badging: 'setAppBadge' in navigator
    };
  }

  /**
   * Share content using Web Share API
   */
  async share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (!('share' in navigator)) {
      console.warn('Web Share API not supported');
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  }

  /**
   * Set app badge (if supported)
   */
  async setBadge(count?: number): Promise<boolean> {
    if (!('setAppBadge' in navigator)) {
      console.warn('App Badging API not supported');
      return false;
    }

    try {
      if (count !== undefined) {
        await (navigator as any).setAppBadge(count);
      } else {
        await (navigator as any).setAppBadge();
      }
      return true;
    } catch (error) {
      console.error('Error setting app badge:', error);
      return false;
    }
  }

  /**
   * Clear app badge
   */
  async clearBadge(): Promise<boolean> {
    if (!('clearAppBadge' in navigator)) {
      console.warn('App Badging API not supported');
      return false;
    }

    try {
      await (navigator as any).clearAppBadge();
      return true;
    } catch (error) {
      console.error('Error clearing app badge:', error);
      return false;
    }
  }

  /**
   * Initialize PWA functionality
   */
  private initializePWA(): void {
    // Set initial online status
    this.store.dispatch('SET_ONLINE_STATUS', navigator.onLine);

    // Set initial installation status
    this.store.dispatch('SET_INSTALLED', this.isRunningStandalone());

    // Listen for online/offline events
    this.setupOnlineStatusListener();

    // Listen for beforeinstallprompt event
    this.setupInstallPromptListener();

    // Setup service worker if available
    this.setupServiceWorker().catch(error => {
      console.warn('Service Worker setup failed:', error);
    });

    // Listen for app installed event
    this.setupAppInstalledListener();
  }

  /**
   * Setup online/offline status listener
   */
  private setupOnlineStatusListener(): void {
    if (typeof window === 'undefined') {
      return; // Skip for SSR
    }

    // Listen for online/offline events
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));
    
    merge(online$, offline$).subscribe(isOnline => {
      this.store.dispatch('SET_ONLINE_STATUS', isOnline);
    });
  }

  /**
   * Setup install prompt listener
   */
  private setupInstallPromptListener(): void {
    if (typeof window === 'undefined') {
      return; // Skip for SSR
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      
      // Stash the event so it can be triggered later
      this.deferredPrompt = event;
      
      // Update state
      this.store.dispatch('SET_INSTALLABLE', true);
      this.store.dispatch('SET_INSTALL_PROMPT', event);
      
      console.log('PWA install prompt available');
    });
  }

  /**
   * Setup app installed listener
   */
  private setupAppInstalledListener(): void {
    if (typeof window === 'undefined') {
      return; // Skip for SSR
    }

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.store.dispatch('SET_INSTALLED', true);
      this.store.dispatch('SET_INSTALLABLE', false);
      
      // Clear the deferredPrompt
      this.deferredPrompt = null;
      this.store.dispatch('SET_INSTALL_PROMPT', null);
    });
  }

  /**
   * Setup service worker
   */
  private async setupServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    // Skip service worker registration in development
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.log('Service Worker registration skipped in development environment');
      return;
    }

    // Register service worker
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
        this.swRegistration = registration;

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
                this.store.dispatch('SET_UPDATE_AVAILABLE', true);
                console.log('New service worker update available');
              }
            });
          }
        });

        // Check for existing updates
        if (registration.waiting) {
          this.store.dispatch('SET_UPDATE_AVAILABLE', true);
        }
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'SW_UPDATED':
            this.store.dispatch('SET_UPDATE_AVAILABLE', true);
            break;
          case 'SW_OFFLINE_READY':
            console.log('App is ready to work offline');
            break;
          default:
            console.log('Service Worker message:', event.data);
        }
      }
    });
  }
}
