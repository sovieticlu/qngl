import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { ThemeState } from '../../store/app.state';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LanguageSelectorComponent
  ],
  template: `
    <div class="auth-layout" [attr.data-theme]="(themeState$ | async)?.currentTheme">
      <!-- Auth Header -->
      <header class="auth-header">
        <div class="header-container">
          <!-- Logo/Brand -->
          <div class="brand">
            <h1 class="brand-title" (click)="navigateToHome()">
              SocialVariant
            </h1>
            <p class="brand-subtitle">Welcome to our platform</p>
          </div>

          <!-- Utility Actions -->
          <div class="header-actions">
            <app-language-selector></app-language-selector>
            <button 
              (click)="toggleTheme()" 
              class="theme-toggle-btn" 
              [title]="getThemeToggleTitle()">
              {{ (themeState$ | async)?.isDarkMode ? '☀️' : '🌙' }}
            </button>
          </div>
        </div>
      </header>

      <!-- Auth Content -->
      <main class="auth-main">
        <div class="auth-container">
          <div class="auth-content">
            <!-- This is where auth routes will be rendered -->
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="auth-footer">
        <div class="footer-container">
          <p class="footer-text">
            © 2025 SocialVariant. All rights reserved.
          </p>
          <div class="footer-links">
            <a href="#" class="footer-link">Privacy Policy</a>
            <a href="#" class="footer-link">Terms of Service</a>
            <a href="#" class="footer-link">Support</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  themeState$: Observable<ThemeState>;
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private languageService: LanguageService
  ) {
    this.themeState$ = this.themeService.themeState$;
  }

  ngOnInit(): void {
    // Any initialization logic for the auth layout
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeToggleTitle(): string {
    // You could use LanguageService here for internationalization
    return 'Toggle theme';
  }
}
