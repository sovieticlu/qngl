import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-new-password-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <div class="auth-page new-password-page">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Create New Password</h1>
        <p class="auth-subtitle">Your new password must be different from previously used passwords</p>
      </div>

      <!-- Form -->
      <form [formGroup]="newPasswordForm" (ngSubmit)="onSubmit()" class="auth-form">
        <!-- New Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">New Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              [type]="showPassword ? 'text' : 'password'"
              formControlName="password"
              class="form-input"
              [class.error]="newPasswordForm.get('password')?.invalid && newPasswordForm.get('password')?.touched"
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
          
          <!-- Password Strength Indicator -->
          <div class="password-strength" *ngIf="newPasswordForm.get('password')?.value">
            <div class="strength-bar">
              <div class="strength-fill" [class]="getPasswordStrengthClass()"></div>
            </div>
            <span class="strength-text" [class]="getPasswordStrengthClass()">
              {{ getPasswordStrengthText() }}
            </span>
          </div>

          <div class="form-error" *ngIf="newPasswordForm.get('password')?.invalid && newPasswordForm.get('password')?.touched">
            <span *ngIf="newPasswordForm.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="newPasswordForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
            <span *ngIf="newPasswordForm.get('password')?.errors?.['pattern']">Password must contain uppercase, lowercase, number, and special character</span>
          </div>

          <!-- Password Requirements -->
          <div class="password-requirements">
            <h4>Password must contain:</h4>
            <ul>
              <li [class.valid]="hasMinLength">At least 8 characters</li>
              <li [class.valid]="hasUppercase">One uppercase letter</li>
              <li [class.valid]="hasLowercase">One lowercase letter</li>
              <li [class.valid]="hasNumber">One number</li>
              <li [class.valid]="hasSpecialChar">One special character</li>
            </ul>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm New Password</label>
          <div class="password-input-wrapper">
            <input
              id="confirmPassword"
              [type]="showConfirmPassword ? 'text' : 'password'"
              formControlName="confirmPassword"
              class="form-input"
              [class.error]="newPasswordForm.get('confirmPassword')?.invalid && newPasswordForm.get('confirmPassword')?.touched"
              placeholder="Confirm your new password"
              autocomplete="new-password">
            <button
              type="button"
              class="password-toggle"
              (click)="toggleConfirmPasswordVisibility()"
              [title]="showConfirmPassword ? 'Hide password' : 'Show password'">
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="form-error" *ngIf="newPasswordForm.get('confirmPassword')?.invalid && newPasswordForm.get('confirmPassword')?.touched">
            <span *ngIf="newPasswordForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
            <span *ngIf="newPasswordForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="auth-button primary"
          [disabled]="newPasswordForm.invalid || isLoading"
          [class.loading]="isLoading">
          <span *ngIf="!isLoading">Reset Password</span>
          <span *ngIf="isLoading">Updating password...</span>
        </button>

        <!-- Success Message -->
        <div class="success-message" *ngIf="passwordUpdated">
          <div class="success-icon">✅</div>
          <h3>Password Updated Successfully!</h3>
          <p>Your password has been updated. You can now sign in with your new password.</p>
          <a routerLink="/auth/login" class="auth-button primary">
            Continue to Sign In
          </a>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./new-password-page.component.scss']
})
export class NewPasswordPageComponent {
  newPasswordForm: FormGroup;
  isLoading = false;
  passwordUpdated = false;
  showPassword = false;
  showConfirmPassword = false;
  resetToken = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.newPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Get reset token from query params
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      if (!this.resetToken) {
        this.notificationService.error('Invalid reset link. Please request a new password reset.');
        this.router.navigate(['/auth/forgot-password']);
      }
    });
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

  get currentPassword(): string {
    return this.newPasswordForm.get('password')?.value || '';
  }

  get hasMinLength(): boolean {
    return this.currentPassword.length >= 8;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.currentPassword);
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.currentPassword);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.currentPassword);
  }

  get hasSpecialChar(): boolean {
    return /[@$!%*?&]/.test(this.currentPassword);
  }

  getPasswordStrengthClass(): string {
    const score = this.getPasswordStrengthScore();
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const score = this.getPasswordStrengthScore();
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Medium';
    return 'Strong';
  }

  private getPasswordStrengthScore(): number {
    let score = 0;
    if (this.hasMinLength) score++;
    if (this.hasUppercase) score++;
    if (this.hasLowercase) score++;
    if (this.hasNumber) score++;
    if (this.hasSpecialChar) score++;
    return score;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.newPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const { password } = this.newPasswordForm.value;

    try {
      await this.mockResetPassword(this.resetToken, password);
      this.passwordUpdated = true;
      this.notificationService.success('Password updated successfully!');
    } catch (error: any) {
      this.notificationService.error(
        error?.message || 'Failed to update password. Please try again.'
      );
    } finally {
      this.isLoading = false;
    }
  }

  private async mockResetPassword(token: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (token && password.length >= 8) {
          resolve();
        } else {
          reject(new Error('Invalid token or password'));
        }
      }, 1500);
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.newPasswordForm.controls).forEach(key => {
      const control = this.newPasswordForm.get(key);
      control?.markAsTouched();
    });
  }
}
