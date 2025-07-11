import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../services/app-state.service';
import { ViewportState } from '../../../services/viewport.service';
import { LanguageSelectorComponent } from '../../../components/language-selector/language-selector.component';
import { NotificationService } from '../../../services/notification.service';
import { ThemeService } from '../../../services/theme.service';
import { PWAService } from '../../../services/pwa.service';
import { NightModeService } from '../../../services/night-mode.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LanguageSelectorComponent
  ],
  template: `
    <header class="main-header" [class]="'device-' + (viewportState?.deviceType || 'desktop')">
      <div class="header-container">
        <!-- Left Section: Mobile Toggle + Logo -->
        <div class="header-left">
          <!-- Always show mobile toggle on small screens -->
          <button 
            class="mobile-menu-toggle" 
            *ngIf="shouldShowMobileMenu"
            (click)="toggleMobileSidebar.emit()"
            [class.active]="isMobileSidebarOpen"
            title="Toggle menu"
            aria-label="Toggle navigation menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>

          <!-- Fallback mobile toggle for testing -->
          <button 
            class="mobile-menu-toggle mobile-menu-fallback" 
            (click)="toggleMobileSidebar.emit()"
            [class.active]="isMobileSidebarOpen"
            title="Toggle menu (fallback)"
            aria-label="Toggle navigation menu">
            ☰
          </button>

          <div class="header-brand">
            <div class="logo">
              <h1 routerLink="/" class="brand-title">SocialVariant</h1>
            </div>
          </div>
        </div>

        <!-- Right Section: User Actions + Utilities -->
        <div class="header-right">
          <!-- User Section for authenticated users -->
          <div class="user-section" *ngIf="isAuthenticated && currentUser">
            <div class="user-profile" *ngIf="!isMobile">
              <div class="user-avatar">
                <img [src]="currentUser.avatar || '/assets/default-avatar.svg'" 
                     [alt]="getUserDisplayName(currentUser) + ' avatar'"
                     class="avatar-image">
              </div>
              <div class="user-details">
                <span class="user-name">{{ getUserDisplayName(currentUser) }}</span>
                <span class="user-role" *ngIf="isAdmin(currentUser)">Admin</span>
              </div>
            </div>
            
            <div class="action-separator" *ngIf="!isMobile"></div>
          </div>

          <!-- Action Buttons Section -->
          <div class="action-buttons">
            <!-- Auth Actions for guests -->
            <div class="auth-actions" *ngIf="!isAuthenticated">
              <button (click)="navigateToLogin.emit()" class="action-btn login-btn">
                <span class="btn-icon">🔑</span>
                <span class="btn-text" *ngIf="!isMobile">Login</span>
              </button>
              <button (click)="navigateToRegister.emit()" class="action-btn register-btn primary">
                <span class="btn-icon">✨</span>
                <span class="btn-text" *ngIf="!isMobile">Register</span>
              </button>
            </div>

            <!-- User Actions for authenticated users -->
            <div class="user-actions" *ngIf="isAuthenticated">
              <button (click)="logout.emit()" class="action-btn logout-btn" title="Logout">
                <span class="btn-icon">🚪</span>
                <span class="btn-text" *ngIf="!isMobile">Logout</span>
              </button>
            </div>

            <!-- Utility Actions -->
            <div class="utility-actions">
              <div class="action-separator" *ngIf="!isMobile"></div>
              
              <app-language-selector class="language-selector"></app-language-selector>
              
              <button (click)="toggleTheme()" class="action-btn theme-toggle" title="Toggle Theme">
                <span class="btn-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
                <span class="btn-text sr-only">Toggle Theme</span>
              </button>

              <button (click)="toggleNightMode()" 
                      class="action-btn night-mode-toggle" 
                      title="Toggle Night Mode"
                      *ngIf="!isMobile">
                <span class="btn-icon">{{ isNightMode ? '🌅' : '🌃' }}</span>
                <span class="btn-text sr-only">Toggle Night Mode</span>
              </button>

              <button (click)="installPWA()" 
                      class="action-btn pwa-install" 
                      title="Install App"
                      *ngIf="canInstallPWA && !isMobile">
                <span class="btn-icon">📱</span>
                <span class="btn-text sr-only">Install App</span>
              </button>
              
              <button (click)="showDemoNotification()" 
                      class="action-btn demo-btn" 
                      title="Show Demo Notification" 
                      *ngIf="!isMobile">
                <span class="btn-icon">📢</span>
                <span class="btn-text sr-only">Demo Notification</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent {
  @Input() currentUser: User | null = null;
  @Input() isAuthenticated: boolean | null = false;
  @Input() isMobileSidebarOpen: boolean = false;
  @Input() viewportState: ViewportState | null = null;
  
  @Output() logout = new EventEmitter<void>();
  @Output() navigateToLogin = new EventEmitter<void>();
  @Output() navigateToRegister = new EventEmitter<void>();
  @Output() toggleMobileSidebar = new EventEmitter<void>();

  constructor(
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private pwaService: PWAService,
    private nightModeService: NightModeService,
    private languageService: LanguageService
  ) {}

  get isMobile(): boolean {
    return this.viewportState?.isMobile ?? false;
  }

  get isTablet(): boolean {
    return this.viewportState?.isTablet ?? false;
  }

  get shouldShowMobileMenu(): boolean {
    return this.isMobile || this.isTablet;
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode;
  }

  get isNightMode(): boolean {
    return this.nightModeService.isNightMode;
  }

  get canInstallPWA(): boolean {
    return this.pwaService.canInstall();
  }

  getUserDisplayName(user: User | null): string {
    if (!user) return '';
    return user.name || user.email;
  }

  isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.notificationService.handleAppEvent('theme-changed');
  }

  toggleNightMode(): void {
    this.nightModeService.toggleNightMode();
  }

  async installPWA(): Promise<void> {
    const success = await this.pwaService.installApp();
    if (success) {
      this.notificationService.success('App installed successfully!');
    } else {
      this.notificationService.error('Failed to install app. Please try again.');
    }
  }

  showDemoNotification(): void {
    this.notificationService.info('This is a demo notification from the header!');
  }
}
