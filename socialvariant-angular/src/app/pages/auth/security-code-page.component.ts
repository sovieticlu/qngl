import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-security-code-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <div class="auth-page security-code-page">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Enter Security Code</h1>
        <p class="auth-subtitle">
          We've sent a 6-digit verification code to <strong>{{ maskedEmail }}</strong>
        </p>
      </div>

      <!-- Form -->
      <form [formGroup]="codeForm" (ngSubmit)="onSubmit()" class="auth-form">
        <!-- Security Code Input -->
        <div class="form-group">
          <label class="form-label">Verification Code</label>
          <div class="code-input-container">
            <input
              *ngFor="let digit of digits; let i = index"
              #codeInput
              type="text"
              maxlength="1"
              class="code-input"
              [class.error]="hasError"
              [value]="codeValue[i] || ''"
              (input)="onCodeInput($event, i)"
              (keydown)="onKeyDown($event, i)"
              (paste)="onPaste($event)"
              autocomplete="one-time-code">
          </div>
          <div class="form-error" *ngIf="hasError">
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <!-- Timer -->
        <div class="timer-section" *ngIf="timeLeft > 0">
          <p class="timer-text">
            Code expires in <strong>{{ formatTime(timeLeft) }}</strong>
          </p>
        </div>

        <!-- Resend Section -->
        <div class="resend-section" *ngIf="timeLeft === 0">
          <p class="expired-text">Code has expired</p>
          <button
            type="button"
            class="resend-button"
            (click)="resendCode()"
            [disabled]="isResending">
            <span *ngIf="!isResending">Send New Code</span>
            <span *ngIf="isResending">Sending...</span>
          </button>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="auth-button primary"
          [disabled]="!isCodeComplete || isLoading || timeLeft === 0"
          [class.loading]="isLoading">
          <span *ngIf="!isLoading">Verify Code</span>
          <span *ngIf="isLoading">Verifying...</span>
        </button>

        <!-- Help Section -->
        <div class="help-section">
          <p class="help-text">
            Didn't receive the code? 
            <button
              type="button"
              class="resend-link"
              (click)="resendCode()"
              [disabled]="isResending || timeLeft > 0">
              Send again
            </button>
          </p>
          <p class="help-text">
            <a routerLink="/auth/forgot-password" class="auth-link">
              Try a different email
            </a>
          </p>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./security-code-page.component.scss']
})
export class SecurityCodePageComponent {
  codeForm: FormGroup;
  isLoading = false;
  isResending = false;
  hasError = false;
  errorMessage = '';
  timeLeft = 300; // 5 minutes in seconds
  timer: any;
  digits = Array(6).fill(0);
  codeValue: string[] = Array(6).fill('');
  maskedEmail = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Get email from query params and mask it
    this.route.queryParams.subscribe(params => {
      const email = params['email'] || 'your email';
      this.maskedEmail = this.maskEmail(email);
    });

    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  get isCodeComplete(): boolean {
    return this.codeValue.every(digit => digit !== '');
  }

  private maskEmail(email: string): string {
    if (!email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 
      ? local.substring(0, 2) + '*'.repeat(local.length - 2)
      : local;
    return `${maskedLocal}@${domain}`;
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.timeLeft = 0;
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onCodeInput(event: any, index: number): void {
    const value = event.target.value;
    
    if (!/^\d*$/.test(value)) {
      event.target.value = '';
      return;
    }

    this.codeValue[index] = value;
    this.hasError = false;
    this.errorMessage = '';

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = event.target.nextElementSibling;
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Auto-submit when all digits are entered
    if (this.isCodeComplete) {
      setTimeout(() => this.onSubmit(), 100);
    }
  }

  onKeyDown(event: any, index: number): void {
    if (event.key === 'Backspace' && !event.target.value && index > 0) {
      // Focus previous input on backspace
      const prevInput = event.target.previousElementSibling;
      if (prevInput) {
        prevInput.focus();
        this.codeValue[index - 1] = '';
        prevInput.value = '';
      }
    }
  }

  onPaste(event: any): void {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    for (let i = 0; i < digits.length; i++) {
      this.codeValue[i] = digits[i];
      const input = event.target.parentElement.children[i];
      if (input) {
        input.value = digits[i];
      }
    }

    // Focus last filled input or first empty one
    const lastIndex = Math.min(digits.length - 1, 5);
    const targetInput = event.target.parentElement.children[lastIndex];
    if (targetInput) {
      targetInput.focus();
    }

    if (digits.length === 6) {
      setTimeout(() => this.onSubmit(), 100);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.isCodeComplete || this.timeLeft === 0) {
      return;
    }

    this.isLoading = true;
    const code = this.codeValue.join('');

    try {
      await this.mockVerifyCode(code);
      this.notificationService.success('Code verified successfully!');
      this.router.navigate(['/auth/new-password'], { 
        queryParams: { token: 'mock-reset-token' }
      });
    } catch (error: any) {
      this.hasError = true;
      this.errorMessage = error?.message || 'Invalid code. Please try again.';
      this.clearCode();
    } finally {
      this.isLoading = false;
    }
  }

  async resendCode(): Promise<void> {
    this.isResending = true;
    
    try {
      await this.mockResendCode();
      this.notificationService.success('New verification code sent!');
      this.timeLeft = 300; // Reset timer to 5 minutes
      this.startTimer();
      this.clearCode();
    } catch (error: any) {
      this.notificationService.error('Failed to send new code. Please try again.');
    } finally {
      this.isResending = false;
    }
  }

  private clearCode(): void {
    this.codeValue = Array(6).fill('');
    const inputs = document.querySelectorAll('.code-input') as NodeListOf<HTMLInputElement>;
    inputs.forEach((input, index) => {
      input.value = '';
      if (index === 0) {
        input.focus();
      }
    });
  }

  private async mockVerifyCode(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation - accept '123456' as valid code
        if (code === '123456') {
          resolve();
        } else {
          reject(new Error('Invalid verification code'));
        }
      }, 1000);
    });
  }

  private async mockResendCode(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1500);
    });
  }
}
