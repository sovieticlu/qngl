import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request and add authentication token if available
    let authReq = req;
    
    // Get auth token from AuthService
    const token = this.authService.getToken();
    if (token && !req.headers.has('Authorization')) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    // Add common headers
    authReq = authReq.clone({
      headers: authReq.headers
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Cache-Control', 'no-cache')
    });

    console.log(`[API] ${authReq.method} ${authReq.url}`, authReq.body);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle different error status codes
        switch (error.status) {
          case 401:
            // Unauthorized - redirect to login
            this.authService.logout();
            this.notificationService.error('Session expired. Please login again.');
            break;
          case 403:
            // Forbidden
            this.notificationService.error('Access denied. You do not have permission to perform this action.');
            break;
          case 404:
            // Not found
            this.notificationService.error('The requested resource was not found.');
            break;
          case 500:
            // Internal server error
            this.notificationService.error('Internal server error. Please try again later.');
            break;
          case 0:
            // Network error
            this.notificationService.error('Network error. Please check your internet connection.');
            break;
          default:
            // Other errors
            const message = error.error?.message || error.message || 'An unexpected error occurred';
            this.notificationService.error(message);
        }

        return throwError(() => error);
      }),
      finalize(() => {
        console.log(`[API] Request completed: ${authReq.method} ${authReq.url}`);
      })
    );
  }
}
