import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <div class="auth-page forgot-password-page">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Reset Password</h1>
        <p class="auth-subtitle">Enter your email address and we'll send you a link to reset your password</p>
      </div>

      <!-- Form -->
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="auth-form">
        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="form-input"
            [class.error]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
            placeholder="Enter your email address"
            autocomplete="email">
          <div class="form-error" *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched">
            <span *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="auth-button primary"
          [disabled]="forgotPasswordForm.invalid || isLoading"
          [class.loading]="isLoading">
          <span *ngIf="!isLoading">Send Reset Link</span>
          <span *ngIf="isLoading">Sending...</span>
        </button>

        <!-- Success Message -->
        <div class="success-message" *ngIf="emailSent">
          <div class="success-icon">✅</div>
          <h3>Check Your Email</h3>
          <p>
            We've sent a password reset link to <strong>{{ submittedEmail }}</strong>
          </p>
          <p class="success-note">
            If you don't see the email, check your spam folder or 
            <button type="button" class="resend-link" (click)="resendEmail()">
              try again
            </button>
          </p>
        </div>

        <!-- Additional Help -->
        <div class="help-section" *ngIf="!emailSent">
          <p class="help-text">
            Remember your password? 
            <a routerLink="/auth/login" class="auth-link">Back to sign in</a>
          </p>
          <p class="help-text">
            Don't have an account? 
            <a routerLink="/auth/register" class="auth-link">Create one here</a>
          </p>
        </div>

        <!-- Back to Login (after email sent) -->
        <div class="back-section" *ngIf="emailSent">
          <a routerLink="/auth/login" class="auth-button secondary">
            Back to Sign In
          </a>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./forgot-password-page.component.scss']
})
export class ForgotPasswordPageComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;
  submittedEmail = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const { email } = this.forgotPasswordForm.value;
    this.submittedEmail = email;

    try {
      // Simulate API call
      await this.mockForgotPasswordApi(email);
      this.emailSent = true;
      this.notificationService.success('Password reset email sent successfully!');
    } catch (error: any) {
      this.notificationService.error(
        error?.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      this.isLoading = false;
    }
  }

  async resendEmail(): Promise<void> {
    if (this.submittedEmail) {
      this.isLoading = true;
      try {
        await this.mockForgotPasswordApi(this.submittedEmail);
        this.notificationService.success('Reset email sent again!');
      } catch (error: any) {
        this.notificationService.error('Failed to resend email. Please try again.');
      } finally {
        this.isLoading = false;
      }
    }
  }

  private async mockForgotPasswordApi(email: string): Promise<void> {
    // Simulate API delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation - accept any valid email
        if (email && email.includes('@')) {
          resolve();
        } else {
          reject(new Error('Invalid email address'));
        }
      }, 1500);
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }
}
