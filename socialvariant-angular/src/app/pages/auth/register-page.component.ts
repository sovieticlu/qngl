import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <div class="auth-page register-page">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join us and start your journey today</p>
      </div>

      <!-- Register Form -->
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
        <!-- Name Field -->
        <div class="form-group">
          <label for="name" class="form-label">Full Name</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="form-input"
            [class.error]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
            placeholder="Enter your full name"
            autocomplete="name">
          <div class="form-error" *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
            <span *ngIf="registerForm.get('name')?.errors?.['required']">Full name is required</span>
            <span *ngIf="registerForm.get('name')?.errors?.['minlength']">Name must be at least 2 characters</span>
          </div>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="form-input"
            [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            placeholder="Enter your email address"
            autocomplete="email">
          <div class="form-error" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
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
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              placeholder="Create a strong password"
              autocomplete="new-password">
            <button
              type="button"
              class="password-toggle"
              (click)="togglePasswordVisibility()"
              [title]="showPassword ? 'Hide password' : 'Show password'">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="form-error" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
            <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
            <span *ngIf="registerForm.get('password')?.errors?.['pattern']">Password must contain at least one uppercase, lowercase, number, and special character</span>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <div class="password-input-wrapper">
            <input
              id="confirmPassword"
              [type]="showConfirmPassword ? 'text' : 'password'"
              formControlName="confirmPassword"
              class="form-input"
              [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              placeholder="Confirm your password"
              autocomplete="new-password">
            <button
              type="button"
              class="password-toggle"
              (click)="toggleConfirmPasswordVisibility()"
              [title]="showConfirmPassword ? 'Hide password' : 'Show password'">
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="form-error" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
            <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
            <span *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
          </div>
        </div>

        <!-- Terms and Privacy Agreement -->
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              formControlName="agreeToTerms"
              class="checkbox-input">
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">
              I agree to the 
              <a href="#" class="terms-link">Terms of Service</a> and 
              <a href="#" class="terms-link">Privacy Policy</a>
            </span>
          </label>
          <div class="form-error" *ngIf="registerForm.get('agreeToTerms')?.invalid && registerForm.get('agreeToTerms')?.touched">
            <span>You must agree to the terms and privacy policy</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="auth-button primary"
          [disabled]="registerForm.invalid || isLoading"
          [class.loading]="isLoading">
          <span *ngIf="!isLoading">Create Account</span>
          <span *ngIf="isLoading">Creating account...</span>
        </button>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or</span>
        </div>

        <!-- Social Registration Options -->
        <div class="social-login">
          <button type="button" class="social-button google" (click)="signUpWithGoogle()">
            <span class="social-icon">🌐</span>
            Sign up with Google
          </button>
          <button type="button" class="social-button github" (click)="signUpWithGitHub()">
            <span class="social-icon">⚫</span>
            Sign up with GitHub
          </button>
        </div>
      </form>

      <!-- Footer -->
      <div class="auth-footer">
        <p class="auth-footer-text">
          Already have an account?
          <a routerLink="/auth/login" class="auth-link">Sign in here</a>
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./login-page.component.scss']
})
export class RegisterPageComponent {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const { name, email, password, confirmPassword } = this.registerForm.value;

    try {
      this.authService.register({ name, email, password, confirmPassword }).subscribe({
        next: (user) => {
          this.notificationService.success('Account created successfully! Please check your email for verification.');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.notificationService.error(
            error?.message || 'Registration failed. Please try again.'
          );
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error: any) {
      this.notificationService.error(
        error?.message || 'Registration failed. Please try again.'
      );
      this.isLoading = false;
    }
  }

  async signUpWithGoogle(): Promise<void> {
    try {
      this.notificationService.info('Google sign-up coming soon!');
      // TODO: Implement Google OAuth
    } catch (error: any) {
      this.notificationService.error('Google sign-up failed');
    }
  }

  async signUpWithGitHub(): Promise<void> {
    try {
      this.notificationService.info('GitHub sign-up coming soon!');
      // TODO: Implement GitHub OAuth
    } catch (error: any) {
      this.notificationService.error('GitHub sign-up failed');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
