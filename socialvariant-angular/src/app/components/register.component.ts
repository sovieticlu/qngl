import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, RegisterData } from '../services/auth.service';
import { DocumentHeadService } from '../services/document-head.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>{{ translate('auth.create_account') }}</h1>
          <p>{{ translate('auth.join_socialvariant') }}</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-group">
            <label for="name">{{ translate('auth.full_name') }}</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              [class.error]="registerForm.get('name')?.touched && registerForm.get('name')?.invalid"
              placeholder="{{ translate('auth.full_name_placeholder') }}"
              autocomplete="name"
            >
            <div class="error-message" *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid">
              <span *ngIf="registerForm.get('name')?.errors?.['required']">
                {{ translate('auth.name_required') }}
              </span>
              <span *ngIf="registerForm.get('name')?.errors?.['minlength']">
                {{ translate('auth.name_min_length') }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="email">{{ translate('auth.email') }}</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              [class.error]="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
              placeholder="{{ translate('auth.email_placeholder') }}"
              autocomplete="email"
            >
            <div class="error-message" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">
                {{ translate('auth.email_required') }}
              </span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">
                {{ translate('auth.email_invalid') }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">{{ translate('auth.password') }}</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              [class.error]="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
              placeholder="{{ translate('auth.password_placeholder') }}"
              autocomplete="new-password"
            >
            <div class="error-message" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
              <span *ngIf="registerForm.get('password')?.errors?.['required']">
                {{ translate('auth.password_required') }}
              </span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">
                {{ translate('auth.password_min_length') }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">{{ translate('auth.confirm_password') }}</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              [class.error]="registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.invalid"
              placeholder="{{ translate('auth.confirm_password_placeholder') }}"
              autocomplete="new-password"
            >
            <div class="error-message" *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.invalid">
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">
                {{ translate('auth.confirm_password_required') }}
              </span>
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">
                {{ translate('auth.passwords_dont_match') }}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            class="register-btn"
            [disabled]="registerForm.invalid || isSubmitting"
          >
            <span *ngIf="!isSubmitting">{{ translate('auth.create_account') }}</span>
            <span *ngIf="isSubmitting" class="loading-spinner">{{ translate('common.loading') }}...</span>
          </button>

          <div class="form-footer">
            <p>
              {{ translate('auth.already_have_account') }}
              <a routerLink="/login">{{ translate('auth.sign_in') }}</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isSubmitting = false;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private documentHeadService: DocumentHeadService,
    private languageService: LanguageService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // Set page meta tags
    this.documentHeadService.updateHead({
      title: this.translate('auth.register_title'),
      description: this.translate('auth.register_description'),
      keywords: 'register, sign up, create account, join, SocialVariant'
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private createForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const registerData: RegisterData = this.registerForm.value;

    this.subscriptions.add(
      this.authService.register(registerData).subscribe({
        next: (user) => {
          this.isSubmitting = false;
          // Redirect to home after successful registration
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isSubmitting = false;
          // Error handling is done in the auth service
        }
      })
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }
}
