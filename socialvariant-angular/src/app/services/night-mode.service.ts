import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, fromEvent, merge } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { AppStore } from '../store/app.store';
import { ThemeService } from './theme.service';

export interface NightModeConfig {
  autoDetect: boolean;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  enableBlueLight: boolean;
  blueFilter: number; // 0-100 percentage
  dimBrightness: boolean;
  brightnessLevel: number; // 0-100 percentage
}

@Injectable({
  providedIn: 'root'
})
export class NightModeService {
  private readonly defaultConfig: NightModeConfig = {
    autoDetect: true,
    startTime: '20:00',
    endTime: '06:00',
    enableBlueLight: true,
    blueFilter: 20,
    dimBrightness: false,
    brightnessLevel: 80
  };

  private currentConfig: NightModeConfig;
  private nightModeTimer: any;
  private mediaQuery: MediaQueryList | null = null;

  constructor(
    private store: AppStore,
    private themeService: ThemeService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.currentConfig = this.loadConfig();
    this.initializeNightMode();
  }

  // Getters for reactive state
  get isDarkMode$(): Observable<boolean> {
    return this.themeService.isDarkMode$;
  }

  get isNightTime$(): Observable<boolean> {
    return this.isDarkMode$.pipe(
      map(() => this.isNightTime()),
      distinctUntilChanged()
    );
  }

  get isNightMode(): boolean {
    return this.themeService.isDarkMode;
  }

  get config(): NightModeConfig {
    return { ...this.currentConfig };
  }

  /**
   * Enable night mode manually
   */
  enableNightMode(): void {
    this.themeService.setTheme('dark');
    this.applyNightModeEffects();
    this.store.dispatch('ADD_NOTIFICATION', {
      id: Date.now().toString(),
      type: 'info',
      title: 'Night Mode',
      message: 'Night mode enabled',
      duration: 3000,
      timestamp: new Date()
    });
  }

  /**
   * Disable night mode manually
   */
  disableNightMode(): void {
    this.themeService.setTheme('light');
    this.removeNightModeEffects();
    this.store.dispatch('ADD_NOTIFICATION', {
      id: Date.now().toString(),
      type: 'info',
      title: 'Night Mode',
      message: 'Night mode disabled',
      duration: 3000,
      timestamp: new Date()
    });
  }

  /**
   * Toggle night mode
   */
  toggleNightMode(): void {
    if (this.isNightMode) {
      this.disableNightMode();
    } else {
      this.enableNightMode();
    }
  }

  /**
   * Set night mode to auto (follow system preference)
   */
  setAutoMode(): void {
    this.themeService.setTheme('auto');
    this.currentConfig.autoDetect = true;
    this.saveConfig();
    this.setupAutoSchedule();
  }

  /**
   * Update night mode configuration
   */
  updateConfig(config: Partial<NightModeConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };
    this.saveConfig();
    
    // Restart auto schedule if enabled
    if (this.currentConfig.autoDetect) {
      this.setupAutoSchedule();
    }

    // Apply current effects if in night mode
    if (this.isNightMode) {
      this.applyNightModeEffects();
    }
  }

  /**
   * Check if it's currently night time based on configuration
   */
  isNightTime(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startTime = this.parseTime(this.currentConfig.startTime);
    const endTime = this.parseTime(this.currentConfig.endTime);
    
    // Handle overnight periods (e.g., 20:00 to 06:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  /**
   * Get time until next night mode change
   */
  getTimeUntilNextChange(): { hours: number; minutes: number; isNightNext: boolean } {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startTime = this.parseTime(this.currentConfig.startTime);
    const endTime = this.parseTime(this.currentConfig.endTime);
    
    let nextChange: number;
    let isNightNext: boolean;
    
    if (this.isNightTime()) {
      // Currently night, next change is end time
      nextChange = endTime;
      isNightNext = false;
      
      // Handle overnight periods
      if (startTime > endTime && currentTime > endTime) {
        nextChange = endTime + 24 * 60; // Next day
      }
    } else {
      // Currently day, next change is start time
      nextChange = startTime;
      isNightNext = true;
      
      // If start time has passed today, it's tomorrow
      if (currentTime > startTime) {
        nextChange = startTime + 24 * 60; // Next day
      }
    }
    
    let minutesUntil = nextChange - currentTime;
    if (minutesUntil < 0) {
      minutesUntil += 24 * 60; // Add a full day
    }
    
    return {
      hours: Math.floor(minutesUntil / 60),
      minutes: minutesUntil % 60,
      isNightNext
    };
  }

  /**
   * Get night mode status and configuration
   */
  getStatus(): {
    isActive: boolean;
    isAutoDetect: boolean;
    isNightTime: boolean;
    config: NightModeConfig;
    timeUntilChange: { hours: number; minutes: number; isNightNext: boolean };
  } {
    return {
      isActive: this.isNightMode,
      isAutoDetect: this.currentConfig.autoDetect,
      isNightTime: this.isNightTime(),
      config: this.config,
      timeUntilChange: this.getTimeUntilNextChange()
    };
  }

  /**
   * Initialize night mode service
   */
  private initializeNightMode(): void {
    // Setup system preference watcher
    this.setupSystemPreferenceWatcher();
    
    // Setup auto schedule if enabled
    if (this.currentConfig.autoDetect) {
      this.setupAutoSchedule();
    }
    
    // Apply current effects if in night mode
    if (this.isNightMode) {
      this.applyNightModeEffects();
    }
  }

  /**
   * Setup system dark mode preference watcher
   */
  private setupSystemPreferenceWatcher(): void {
    if (typeof window === 'undefined') {
      return; // Skip for SSR
    }

    try {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Listen for changes in system preference
      const systemPreferenceChange$ = fromEvent(this.mediaQuery, 'change').pipe(
        map((event: any) => event.matches),
        startWith(this.mediaQuery.matches)
      );

      systemPreferenceChange$.subscribe(isDark => {
        // Only act on system preference if theme is set to auto
        if (this.themeService.currentTheme === 'auto') {
          if (isDark && !this.isNightMode) {
            this.applyNightModeEffects();
          } else if (!isDark && this.isNightMode) {
            this.removeNightModeEffects();
          }
        }
      });
    } catch (error) {
      console.warn('Could not setup system preference watcher:', error);
    }
  }

  /**
   * Setup automatic night mode schedule
   */
  private setupAutoSchedule(): void {
    // Clear existing timer
    if (this.nightModeTimer) {
      clearTimeout(this.nightModeTimer);
    }

    if (!this.currentConfig.autoDetect) {
      return;
    }

    const scheduleNext = () => {
      const { hours, minutes, isNightNext } = this.getTimeUntilNextChange();
      const msUntilNext = (hours * 60 + minutes) * 60 * 1000;

      this.nightModeTimer = setTimeout(() => {
        if (isNightNext) {
          this.enableNightMode();
        } else {
          this.disableNightMode();
        }
        
        // Schedule the next change
        scheduleNext();
      }, msUntilNext);

      console.log(`Night mode: Next change in ${hours}h ${minutes}m (${isNightNext ? 'enable' : 'disable'})`);
    };

    scheduleNext();
  }

  /**
   * Apply night mode visual effects
   */
  private applyNightModeEffects(): void {
    if (typeof document === 'undefined') {
      return; // Skip for SSR
    }

    const body = this.document.body;
    
    // Add night mode class
    body.classList.add('night-mode');
    
    // Apply blue light filter if enabled
    if (this.currentConfig.enableBlueLight) {
      const filterValue = `sepia(${this.currentConfig.blueFilter}%) saturate(0.8) hue-rotate(180deg)`;
      body.style.filter = filterValue;
    }
    
    // Apply brightness dimming if enabled
    if (this.currentConfig.dimBrightness) {
      const brightnessValue = this.currentConfig.brightnessLevel / 100;
      body.style.filter = body.style.filter 
        ? `${body.style.filter} brightness(${brightnessValue})`
        : `brightness(${brightnessValue})`;
    }
  }

  /**
   * Remove night mode visual effects
   */
  private removeNightModeEffects(): void {
    if (typeof document === 'undefined') {
      return; // Skip for SSR
    }

    const body = this.document.body;
    
    // Remove night mode class
    body.classList.remove('night-mode');
    
    // Remove filters
    body.style.filter = '';
  }

  /**
   * Parse time string to minutes
   */
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): NightModeConfig {
    if (typeof localStorage === 'undefined') {
      return { ...this.defaultConfig };
    }

    try {
      const saved = localStorage.getItem('app-night-mode-config');
      if (saved) {
        return { ...this.defaultConfig, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load night mode config:', error);
    }

    return { ...this.defaultConfig };
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('app-night-mode-config', JSON.stringify(this.currentConfig));
    } catch (error) {
      console.warn('Failed to save night mode config:', error);
    }
  }
}
