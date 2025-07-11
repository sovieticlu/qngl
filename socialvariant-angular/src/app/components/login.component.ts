import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, LoginCredentials } from '../services/auth.service';
import { DocumentHeadService } from '../services/document-head.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>{{ translate('auth.welcome_back') }}</h1>
          <p>{{ translate('auth.sign_in_to_continue') }}</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">{{ translate('auth.email') }}</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              [class.error]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
              placeholder="{{ translate('auth.email_placeholder') }}"
              autocomplete="email"
            >
            <div class="error-message" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">
                {{ translate('auth.email_required') }}
              </span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">
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
              [class.error]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
              placeholder="{{ translate('auth.password_placeholder') }}"
              autocomplete="current-password"
            >
            <div class="error-message" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
              <span *ngIf="loginForm.get('password')?.errors?.['required']">
                {{ translate('auth.password_required') }}
              </span>
              <span *ngIf="loginForm.get('password')?.errors?.['minlength']">
                {{ translate('auth.password_min_length') }}
              </span>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="rememberMe">
              <span class="checkmark"></span>
              {{ translate('auth.remember_me') }}
            </label>
          </div>

          <button 
            type="submit" 
            class="login-btn"
            [disabled]="loginForm.invalid || isSubmitting"
          >
            <span *ngIf="!isSubmitting">{{ translate('auth.sign_in') }}</span>
            <span *ngIf="isSubmitting" class="loading-spinner">{{ translate('common.loading') }}...</span>
          </button>

          <div class="form-footer">
            <p>
              {{ translate('auth.no_account') }}
              <a routerLink="/register">{{ translate('auth.sign_up') }}</a>
            </p>
          </div>
        </form>

        <div class="demo-credentials">
          <h3>{{ translate('auth.demo_credentials') }}</h3>
          <div class="demo-account">
            <strong>Admin:</strong> admin&#64;example.com / admin
          </div>
          <div class="demo-account">
            <strong>User:</strong> user&#64;example.com / user
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
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
      title: this.translate('auth.login_title'),
      description: this.translate('auth.login_description'),
      keywords: 'login, sign in, authentication, SocialVariant'
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private createForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const credentials: LoginCredentials = this.loginForm.value;

    this.subscriptions.add(
      this.authService.login(credentials).subscribe({
        next: (user) => {
          this.isSubmitting = false;
          // Redirect to stored URL or home
          const redirectUrl = sessionStorage.getItem('redirectUrl') || '/';
          sessionStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
        },
        error: (error) => {
          this.isSubmitting = false;
          // Error handling is done in the auth service
        }
      })
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }
}
