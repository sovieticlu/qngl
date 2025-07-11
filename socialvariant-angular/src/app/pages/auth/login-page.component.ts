import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <div class="auth-page login-page">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to your account to continue</p>
        
        <!-- Demo Credentials -->
        <div class="demo-credentials">
          <h4>🔑 Demo Credentials</h4>
          <div class="demo-users">
            <div class="demo-user">
              <strong>Admin:</strong> admin&#64;example.com / admin
            </div>
            <div class="demo-user">
              <strong>User:</strong> user&#64;example.com / user
            </div>
          </div>
        </div>
      </div>

      <!-- Login Form -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="form-input"
            [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            placeholder="Enter your email address"
            autocomplete="email">
          <div class="form-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              [type]="showPassword ? 'text' : 'password'"
              formControlName="password"
              class="form-input"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              placeholder="Enter your password"
              autocomplete="current-password">
            <button
              type="button"
              class="password-toggle"
              (click)="togglePasswordVisibility()"
              [title]="showPassword ? 'Hide password' : 'Show password'">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="form-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="form-row">
          <label class="checkbox-label">
            <input
              type="checkbox"
              formControlName="rememberMe"
              class="checkbox-input">
            <span class="checkbox-custom"></span>
            Remember me
          </label>
          <a routerLink="/auth/forgot-password" class="forgot-link">
            Forgot password?
          </a>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="auth-button primary"
          [disabled]="loginForm.invalid || isLoading"
          [class.loading]="isLoading">
          <span *ngIf="!isLoading">Sign In</span>
          <span *ngIf="isLoading">Signing in...</span>
        </button>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or</span>
        </div>

        <!-- Social Login Options -->
        <div class="social-login">
          <button type="button" class="social-button google" (click)="signInWithGoogle()">
            <span class="social-icon">🌐</span>
            Continue with Google
          </button>
          <button type="button" class="social-button github" (click)="signInWithGitHub()">
            <span class="social-icon">⚫</span>
            Continue with GitHub
          </button>
        </div>
      </form>

      <!-- Footer -->
      <div class="auth-footer">
        <p class="auth-footer-text">
          Don't have an account?
          <a routerLink="/auth/register" class="auth-link">Create one here</a>
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]], // Removed minLength for login
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    try {
      this.authService.login({ email, password }).subscribe({
        next: (user) => {
          this.notificationService.success('Login successful!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.notificationService.error(
            error?.message || 'Login failed. Please check your credentials.'
          );
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error: any) {
      this.notificationService.error(
        error?.message || 'Login failed. Please check your credentials.'
      );
      this.isLoading = false;
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      this.notificationService.info('Google sign-in coming soon!');
      // TODO: Implement Google OAuth
    } catch (error: any) {
      this.notificationService.error('Google sign-in failed');
    }
  }

  async signInWithGitHub(): Promise<void> {
    try {
      this.notificationService.info('GitHub sign-in coming soon!');
      // TODO: Implement GitHub OAuth
    } catch (error: any) {
      this.notificationService.error('GitHub sign-in failed');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
