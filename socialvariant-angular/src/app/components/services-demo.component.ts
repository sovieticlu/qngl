import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ThemeService } from '../services/theme.service';
import { LanguageService } from '../services/language.service';
import { PWAService } from '../services/pwa.service';
import { NightModeService, NightModeConfig } from '../services/night-mode.service';
import { AppStore } from '../store/app.store';

@Component({
  selector: 'app-services-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="services-demo">
      <header class="demo-header">
        <h1>🚀 Services Demo Dashboard</h1>
        <p>Explore all the implemented services with store dispatch patterns</p>
      </header>

      <div class="demo-grid">
        <!-- Theme Service Section -->
        <section class="demo-card theme-demo">
          <h2>🎨 Theme Service</h2>
          <div class="service-status">
            <p><strong>Current Theme:</strong> {{ themeState.currentTheme }}</p>
            <p><strong>Dark Mode:</strong> {{ themeState.isDarkMode ? 'Yes' : 'No' }}</p>
            <p><strong>System Dark Mode:</strong> {{ themeState.isSystemDarkMode ? 'Yes' : 'No' }}</p>
          </div>
          
          <div class="actions">
            <button 
              (click)="setTheme('light')" 
              [class.active]="themeState.currentTheme === 'light'"
              class="theme-btn light">
              ☀️ Light
            </button>
            <button 
              (click)="setTheme('dark')" 
              [class.active]="themeState.currentTheme === 'dark'"
              class="theme-btn dark">
              🌙 Dark
            </button>
            <button 
              (click)="setTheme('auto')" 
              [class.active]="themeState.currentTheme === 'auto'"
              class="theme-btn auto">
              🔄 Auto
            </button>
            <button (click)="toggleTheme()" class="theme-btn toggle">
              🔀 Toggle
            </button>
          </div>
        </section>

        <!-- Language Service Section -->
        <section class="demo-card language-demo">
          <h2>🌍 Language Service</h2>
          <div class="service-status">
            <p><strong>Current Language:</strong> {{ languageState.currentLanguage }}</p>
            <p><strong>Loading:</strong> {{ languageState.isLoading ? 'Yes' : 'No' }}</p>
            <p><strong>Available Languages:</strong> {{ languageState.availableLanguages.length }}</p>
          </div>
          
          <div class="language-selector">
            <label for="language-select">Select Language:</label>
            <select 
              id="language-select"
              [value]="languageState.currentLanguage"
              (change)="setLanguage($event)">
              <option 
                *ngFor="let lang of languageState.availableLanguages" 
                [value]="lang.code">
                {{ lang.flag }} {{ lang.name }} ({{ lang.nativeName }})
              </option>
            </select>
          </div>

          <div class="translation-demo">
            <h4>Translation Examples:</h4>
            <ul>
              <li><code>common.loading</code>: "{{ translate('common.loading') }}"</li>
              <li><code>navigation.home</code>: "{{ translate('navigation.home') }}"</li>
              <li><code>auth.login</code>: "{{ translate('auth.login') }}"</li>
            </ul>
          </div>
        </section>

        <!-- PWA Service Section -->
        <section class="demo-card pwa-demo">
          <h2>📱 PWA Service</h2>
          <div class="service-status">
            <p><strong>Installable:</strong> {{ pwaState.isInstallable ? 'Yes' : 'No' }}</p>
            <p><strong>Installed:</strong> {{ pwaState.isInstalled ? 'Yes' : 'No' }}</p>
            <p><strong>Online:</strong> {{ pwaState.isOnline ? 'Yes' : 'No' }}</p>
            <p><strong>Update Available:</strong> {{ pwaState.updateAvailable ? 'Yes' : 'No' }}</p>
          </div>

          <div class="pwa-capabilities">
            <h4>PWA Capabilities:</h4>
            <ul>
              <li>Service Worker: {{ capabilities.serviceWorker ? '✅' : '❌' }}</li>
              <li>Push Notifications: {{ capabilities.pushNotifications ? '✅' : '❌' }}</li>
              <li>Background Sync: {{ capabilities.backgroundSync ? '✅' : '❌' }}</li>
              <li>Web Share: {{ capabilities.webShare ? '✅' : '❌' }}</li>
              <li>App Badging: {{ capabilities.badging ? '✅' : '❌' }}</li>
            </ul>
          </div>
          
          <div class="actions">
            <button 
              (click)="installPWA()" 
              [disabled]="!pwaState.isInstallable || pwaState.isInstalled"
              class="pwa-btn">
              📱 Install App
            </button>
            <button 
              (click)="updatePWA()" 
              [disabled]="!pwaState.updateAvailable"
              class="pwa-btn">
              🔄 Update App
            </button>
            <button 
              (click)="shareApp()" 
              [disabled]="!capabilities.webShare"
              class="pwa-btn">
              📤 Share App
            </button>
            <button 
              (click)="setBadge(5)" 
              [disabled]="!capabilities.badging"
              class="pwa-btn">
              🔢 Set Badge (5)
            </button>
            <button 
              (click)="clearBadge()" 
              [disabled]="!capabilities.badging"
              class="pwa-btn">
              🧹 Clear Badge
            </button>
          </div>
        </section>

        <!-- Night Mode Service Section -->
        <section class="demo-card night-mode-demo">
          <h2>🌃 Night Mode Service</h2>
          <div class="service-status">
            <p><strong>Night Mode Active:</strong> {{ nightModeStatus?.isActive ? 'Yes' : 'No' }}</p>
            <p><strong>Auto Detect:</strong> {{ nightModeStatus?.isAutoDetect ? 'Yes' : 'No' }}</p>
            <p><strong>Is Night Time:</strong> {{ nightModeStatus?.isNightTime ? 'Yes' : 'No' }}</p>
            <p *ngIf="nightModeStatus?.timeUntilChange"><strong>Next Change:</strong> 
              {{ nightModeStatus.timeUntilChange.hours }}h {{ nightModeStatus.timeUntilChange.minutes }}m
              ({{ nightModeStatus.timeUntilChange.isNightNext ? 'Enable' : 'Disable' }})
            </p>
          </div>

          <div class="night-mode-config">
            <h4>Configuration:</h4>
            <div class="config-row">
              <label>
                <input 
                  type="checkbox" 
                  [checked]="nightModeConfig.autoDetect"
                  (change)="updateNightModeConfig({ autoDetect: $any($event.target).checked })">
                Auto Detect
              </label>
            </div>
            <div class="config-row">
              <label>Start Time:</label>
              <input 
                type="time" 
                [value]="nightModeConfig.startTime"
                (change)="updateNightModeConfig({ startTime: $any($event.target).value })">
            </div>
            <div class="config-row">
              <label>End Time:</label>
              <input 
                type="time" 
                [value]="nightModeConfig.endTime"
                (change)="updateNightModeConfig({ endTime: $any($event.target).value })">
            </div>
            <div class="config-row">
              <label>
                <input 
                  type="checkbox" 
                  [checked]="nightModeConfig.enableBlueLight"
                  (change)="updateNightModeConfig({ enableBlueLight: $any($event.target).checked })">
                Blue Light Filter
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                [value]="nightModeConfig.blueFilter"
                [disabled]="!nightModeConfig.enableBlueLight"
                (input)="updateNightModeConfig({ blueFilter: +$any($event.target).value })">
              <span>{{ nightModeConfig.blueFilter }}%</span>
            </div>
          </div>
          
          <div class="actions">
            <button (click)="enableNightMode()" class="night-btn">
              🌃 Enable Night Mode
            </button>
            <button (click)="disableNightMode()" class="night-btn">
              🌅 Disable Night Mode
            </button>
            <button (click)="toggleNightMode()" class="night-btn">
              🔀 Toggle Night Mode
            </button>
            <button (click)="setAutoMode()" class="night-btn">
              🔄 Set Auto Mode
            </button>
          </div>
        </section>

        <!-- Store State Section -->
        <section class="demo-card store-demo">
          <h2>🏪 Store State</h2>
          <div class="store-state">
            <h4>Current Store State:</h4>
            <pre>{{ storeStateJson }}</pre>
          </div>
          
          <div class="actions">
            <button (click)="dispatchCustomAction()" class="store-btn">
              🚀 Dispatch Test Action
            </button>
            <button (click)="resetAllSettings()" class="store-btn danger">
              🔄 Reset All Settings
            </button>
          </div>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./services-demo.component.scss']
})
export class ServicesDemoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State observables
  themeState: any = {};
  languageState: any = {};
  pwaState: any = {};
  nightModeStatus: any = {};
  nightModeConfig: NightModeConfig = {
    autoDetect: true,
    startTime: '20:00',
    endTime: '06:00',
    enableBlueLight: true,
    blueFilter: 20,
    dimBrightness: false,
    brightnessLevel: 80
  };
  capabilities: any = {};
  storeStateJson: string = '';

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private pwaService: PWAService,
    private nightModeService: NightModeService,
    private store: AppStore,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscribeToStates();
    this.loadPWACapabilities();
    this.loadNightModeConfig();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToStates(): void {
    // Subscribe to all state changes
    combineLatest([
      this.themeService.themeState$,
      this.languageService.languageState$,
      this.pwaService.pwaState$,
      this.store.ui$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([themeState, languageState, pwaState, uiState]) => {
      console.log('Theme state updated:', themeState);
      this.themeState = themeState;
      this.languageState = languageState;
      this.pwaState = pwaState;
      this.storeStateJson = JSON.stringify({
        theme: this.store.state.theme,
        language: this.store.state.language,
        pwa: this.store.state.pwa,
        ui: uiState
      }, null, 2);
      this.cdr.detectChanges();
    });

    // Update night mode status periodically
    setInterval(() => {
      try {
        this.nightModeStatus = this.nightModeService.getStatus();
      } catch (error) {
        console.warn('Failed to update night mode status:', error);
      }
    }, 1000);
  }

  private loadPWACapabilities(): void {
    this.capabilities = this.pwaService.getCapabilities();
  }

  private loadNightModeConfig(): void {
    try {
      this.nightModeConfig = this.nightModeService.config;
      this.nightModeStatus = this.nightModeService.getStatus();
    } catch (error) {
      console.warn('Failed to load night mode config:', error);
      this.nightModeStatus = {
        isActive: false,
        isAutoDetect: false,
        isNightTime: false,
        config: null,
        timeUntilChange: { hours: 0, minutes: 0, isNightNext: false }
      };
    }
  }

  // Theme Service Methods
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    console.log('Setting theme to:', theme);
    this.themeService.setTheme(theme);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Language Service Methods
  setLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.languageService.setLanguage(target.value);
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  // PWA Service Methods
  async installPWA(): Promise<void> {
    const success = await this.pwaService.installApp();
    this.store.dispatch('ADD_NOTIFICATION', {
      id: Date.now().toString(),
      type: success ? 'success' : 'error',
      title: 'PWA Installation',
      message: success ? 'App installed successfully!' : 'Failed to install app',
      duration: 3000,
      timestamp: new Date()
    });
  }

  async updatePWA(): Promise<void> {
    const success = await this.pwaService.updateApp();
    this.store.dispatch('ADD_NOTIFICATION', {
      id: Date.now().toString(),
      type: success ? 'success' : 'info',
      title: 'PWA Update',
      message: success ? 'App will reload with updates' : 'No updates available',
      duration: 3000,
      timestamp: new Date()
    });
  }

  async shareApp(): Promise<void> {
    const success = await this.pwaService.share({
      title: 'SocialVariant',
      text: 'Check out this amazing Angular app!',
      url: window.location.href
    });
    
    if (!success) {
      // Fallback: copy URL to clipboard
      navigator.clipboard?.writeText(window.location.href);
      this.store.dispatch('ADD_NOTIFICATION', {
        id: Date.now().toString(),
        type: 'info',
        title: 'Share',
        message: 'URL copied to clipboard',
        duration: 3000,
        timestamp: new Date()
      });
    }
  }

  async setBadge(count: number): Promise<void> {
    const success = await this.pwaService.setBadge(count);
    this.store.dispatch('ADD_NOTIFICATION', {
      id: Date.now().toString(),
      type: success ? 'success' : 'warning',
      title: 'App Badge',
      message: success ? `Badge set to ${count}` : 'Badge not supported',
      duration: 3000,
      timestamp: new Date()
    });
  }

  async clearBadge(): Promise<void> {
    const success = await this.pwaService.clearBadge();
    this.store.dispatch('ADD_NOTIFICATION', {
      id: Date.now().toString(),
      type: success ? 'success' : 'warning',
      title: 'App Badge',
      message: success ? 'Badge cleared' : 'Badge not supported',
      duration: 3000,
      timestamp: new Date()
    });
  }

  // Night Mode Service Methods
  enableNightMode(): void {
    this.nightModeService.enableNightMode();
  }

  disableNightMode(): void {
    this.nightModeService.disableNightMode();
  }

  toggleNightMode(): void {
    this.nightModeService.toggleNightMode();
  }

  setAutoMode(): void {
    this.nightModeService.setAutoMode();
  }

  updateNightModeConfig(config: Partial<NightModeConfig>): void {
    this.nightModeService.updateConfig(config);
    this.nightModeConfig = this.nightModeService.config;
  }

  // Store Methods
  dispatchCustomAction(): void {
    this.store.dispatch('ADD_NOTIFICATION', {
      id: Date.now().toString(),
      type: 'info',
      title: 'Custom Action',
      message: 'This is a custom store action dispatch!',
      duration: 5000,
      timestamp: new Date()
    });
  }

  resetAllSettings(): void {
    // Reset theme
    this.themeService.setTheme('auto');
    
    // Reset language
    this.languageService.setLanguage('en');
    
    // Reset night mode
    this.nightModeService.updateConfig({
      autoDetect: true,
      startTime: '20:00',
      endTime: '06:00',
      enableBlueLight: true,
      blueFilter: 20,
      dimBrightness: false,
      brightnessLevel: 80
    });

    this.store.dispatch('ADD_NOTIFICATION', {
      id: Date.now().toString(),
      type: 'success',
      title: 'Settings Reset',
      message: 'All settings have been reset to defaults',
      duration: 3000,
      timestamp: new Date()
    });
  }
}
