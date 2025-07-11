import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private defaultConfig: ApiConfig = {
    baseUrl: environment.apiUrl || 'http://localhost:3000/api',
    timeout: 30000, // 30 seconds
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Get default headers with optional additional headers
   */
  private getHeaders(additionalHeaders?: { [key: string]: string }): HttpHeaders {
    const headers = { ...this.defaultConfig.headers, ...additionalHeaders };
    return new HttpHeaders(headers);
  }

  /**
   * Build HTTP params from object
   */
  private buildParams(params?: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('API Error:', error);
    this.setLoading(false);
    
    return throwError(() => ({
      success: false,
      error: errorMessage,
      statusCode: error.status,
      originalError: error
    }));
  }

  /**
   * Generic HTTP request method
   */
  private request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    config?: Partial<ApiConfig>,
    params?: { [key: string]: any }
  ): Observable<ApiResponse<T>> {
    const requestConfig = { ...this.defaultConfig, ...config };
    const url = `${requestConfig.baseUrl}${endpoint}`;
    const headers = this.getHeaders(requestConfig.headers);
    const httpParams = this.buildParams(params);

    this.setLoading(true);

    const httpOptions = {
      headers,
      params: httpParams
    };

    let request$: Observable<any>;

    switch (method) {
      case 'GET':
        request$ = this.http.get<T>(url, httpOptions);
        break;
      case 'POST':
        request$ = this.http.post<T>(url, data, httpOptions);
        break;
      case 'PUT':
        request$ = this.http.put<T>(url, data, httpOptions);
        break;
      case 'DELETE':
        request$ = this.http.delete<T>(url, httpOptions);
        break;
      case 'PATCH':
        request$ = this.http.patch<T>(url, data, httpOptions);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return request$.pipe(
      timeout(requestConfig.timeout!),
      retry(requestConfig.retries!),
      map((response: any) => {
        this.setLoading(false);
        // If response is already in ApiResponse format, return it
        if (response && typeof response === 'object' && 'success' in response) {
          return response as ApiResponse<T>;
        }
        // Otherwise, wrap the response
        return {
          success: true,
          data: response as T
        } as ApiResponse<T>;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * GET request
   */
  get<T>(
    endpoint: string,
    params?: { [key: string]: any },
    config?: Partial<ApiConfig>
  ): Observable<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config, params);
  }

  /**
   * POST request
   */
  post<T>(
    endpoint: string,
    data?: any,
    config?: Partial<ApiConfig>,
    params?: { [key: string]: any }
  ): Observable<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config, params);
  }

  /**
   * PUT request
   */
  put<T>(
    endpoint: string,
    data?: any,
    config?: Partial<ApiConfig>,
    params?: { [key: string]: any }
  ): Observable<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config, params);
  }

  /**
   * DELETE request
   */
  delete<T>(
    endpoint: string,
    params?: { [key: string]: any },
    config?: Partial<ApiConfig>
  ): Observable<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config, params);
  }

  /**
   * PATCH request
   */
  patch<T>(
    endpoint: string,
    data?: any,
    config?: Partial<ApiConfig>,
    params?: { [key: string]: any }
  ): Observable<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config, params);
  }

  /**
   * Upload file
   */
  upload<T>(
    endpoint: string,
    file: File,
    additionalData?: { [key: string]: any },
    config?: Partial<ApiConfig>
  ): Observable<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const uploadConfig = {
      ...config,
      headers: {
        ...config?.headers,
        // Don't set Content-Type for FormData, let browser set it
      }
    };
    
    // Remove Content-Type header for file uploads
    if (uploadConfig.headers) {
      delete uploadConfig.headers['Content-Type'];
    }

    return this.request<T>('POST', endpoint, formData, uploadConfig);
  }

  /**
   * External API request (for third-party APIs)
   */
  external<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    headers?: { [key: string]: string },
    params?: { [key: string]: any }
  ): Observable<ApiResponse<T>> {
    const config: Partial<ApiConfig> = {
      baseUrl: '', // Use full URL for external APIs
      headers: {
        ...this.defaultConfig.headers,
        ...headers
      }
    };

    return this.request<T>(method, url, data, config, params);
  }

  /**
   * Update default configuration
   */
  updateConfig(config: Partial<ApiConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.defaultConfig.headers = {
      ...this.defaultConfig.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Remove authorization token
   */
  removeAuthToken(): void {
    if (this.defaultConfig.headers) {
      delete this.defaultConfig.headers['Authorization'];
    }
  }

  /**
   * Get current loading state
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
