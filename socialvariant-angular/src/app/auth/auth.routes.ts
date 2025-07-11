import { Routes } from '@angular/router';
import { guestGuard } from '../guards/auth.guard';

// Auth page components
import { LoginPageComponent } from '../pages/auth/login-page.component';
import { RegisterPageComponent } from '../pages/auth/register-page.component';
import { ForgotPasswordPageComponent } from '../pages/auth/forgot-password-page.component';
import { SecurityCodePageComponent } from '../pages/auth/security-code-page.component';
import { NewPasswordPageComponent } from '../pages/auth/new-password-page.component';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [guestGuard],
    title: 'Sign In - SocialVariant'
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [guestGuard],
    title: 'Create Account - SocialVariant'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordPageComponent,
    canActivate: [guestGuard],
    title: 'Reset Password - SocialVariant'
  },
  {
    path: 'security-code',
    component: SecurityCodePageComponent,
    canActivate: [guestGuard],
    title: 'Verify Code - SocialVariant'
  },
  {
    path: 'new-password',
    component: NewPasswordPageComponent,
    canActivate: [guestGuard],
    title: 'New Password - SocialVariant'
  }
];
