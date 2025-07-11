import { Injectable } from '@angular/core';
import { ThemeService } from './theme.service';
import { LanguageService } from './language.service';
import { PWAService } from './pwa.service';
import { NightModeService } from './night-mode.service';
import { AppStore } from '../store/app.store';

@Injectable({
  providedIn: 'root'
})
export class ServicesInitializerService {
  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private pwaService: PWAService,
    private nightModeService: NightModeService,
    private store: AppStore
  ) {}

  /**
   * Initialize all services on app startup
   */
  initialize(): void {
    console.log('🚀 Initializing SocialVariant services...');
    
    // Services are automatically initialized through their constructors
    // This method serves as a way to ensure they are all instantiated
    
    // Log service states for debugging
    this.logServiceStates();
    
    console.log('✅ All services initialized successfully');
  }

  /**
   * Log current service states for debugging
   */
  private logServiceStates(): void {
    console.group('📊 Service States:');
    
    console.log('🎨 Theme Service:', {
      currentTheme: this.themeService.currentTheme,
      isDarkMode: this.themeService.isDarkMode
    });
    
    console.log('🌍 Language Service:', {
      currentLanguage: this.languageService.currentLanguage,
      availableLanguages: this.languageService.availableLanguages.length,
      isLoading: this.languageService.isLoading
    });
    
    console.log('📱 PWA Service:', {
      isInstallable: this.pwaService.isInstallable,
      isInstalled: this.pwaService.isInstalled,
      isOnline: this.pwaService.isOnline,
      updateAvailable: this.pwaService.updateAvailable
    });
    
    console.log('🌃 Night Mode Service:', {
      isActive: this.nightModeService.isNightMode,
      config: this.nightModeService.config
    });
    
    console.log('🏪 Store State:', this.store.state);
    
    console.groupEnd();
  }

  /**
   * Get initialization status
   */
  getInitializationStatus(): {
    theme: boolean;
    language: boolean;
    pwa: boolean;
    nightMode: boolean;
    store: boolean;
  } {
    return {
      theme: !!this.themeService,
      language: !!this.languageService,
      pwa: !!this.pwaService,
      nightMode: !!this.nightModeService,
      store: !!this.store
    };
  }
}
