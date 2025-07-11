import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication guard - protects routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  sessionStorage.setItem('redirectUrl', state.url);
  
  // Redirect to login page
  router.navigate(['/auth/login']);
  return false;
};

/**
 * Guest guard - redirects authenticated users away from login/register pages
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect authenticated users to home
  router.navigate(['/']);
  return false;
};

/**
 * Admin guard - protects admin-only routes
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    sessionStorage.setItem('redirectUrl', state.url);
    router.navigate(['/auth/login']);
  } else {
    // User is authenticated but not admin
    router.navigate(['/']);
  }
  
  return false;
};

/**
 * Role-based guard factory - creates guards for specific roles
 */
export const roleGuard = (allowedRoles: ('admin' | 'user' | 'guest')[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      sessionStorage.setItem('redirectUrl', state.url);
      router.navigate(['/auth/login']);
      return false;
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // User doesn't have required role
    router.navigate(['/']);
    return false;
  };
};

/**
 * Route matcher guard for lazy loading modules
 */
export const authMatchGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
