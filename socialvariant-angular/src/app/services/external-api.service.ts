import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface ExternalApiConfig {
  apiKey?: string;
  baseUrl: string;
  headers?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class ExternalApiService {

  constructor(private apiService: ApiService) {}

  /**
   * Generic method to call external APIs
   */
  callExternalApi<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    config?: ExternalApiConfig
  ): Observable<ApiResponse<T>> {
    const headers = {
      ...config?.headers
    };

    // Add API key to headers if provided
    if (config?.apiKey) {
      headers['X-API-Key'] = config.apiKey;
    }

    const fullUrl = config?.baseUrl ? `${config.baseUrl}${url}` : url;
    
    return this.apiService.external<T>(fullUrl, method, data, headers);
  }

  /**
   * Example: GitHub API integration
   */
  getGitHubUser(username: string): Observable<ApiResponse<any>> {
    return this.callExternalApi(`/users/${username}`, 'GET', undefined, {
      baseUrl: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  /**
   * Example: GitHub repositories
   */
  getGitHubRepos(username: string): Observable<ApiResponse<any[]>> {
    return this.callExternalApi(`/users/${username}/repos`, 'GET', undefined, {
      baseUrl: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  /**
   * Example: JSONPlaceholder API (for testing)
   */
  getJsonPlaceholderPosts(): Observable<ApiResponse<any[]>> {
    return this.callExternalApi('/posts', 'GET', undefined, {
      baseUrl: 'https://jsonplaceholder.typicode.com'
    });
  }

  /**
   * Example: Weather API
   */
  getWeather(city: string, apiKey: string): Observable<ApiResponse<any>> {
    return this.callExternalApi(`/weather?q=${city}&appid=${apiKey}`, 'GET', undefined, {
      baseUrl: 'https://api.openweathermap.org/data/2.5'
    });
  }

  /**
   * Example: News API
   */
  getNews(apiKey: string, query?: string): Observable<ApiResponse<any>> {
    const params = query ? `?q=${query}&apiKey=${apiKey}` : `?apiKey=${apiKey}`;
    return this.callExternalApi(`/everything${params}`, 'GET', undefined, {
      baseUrl: 'https://newsapi.org/v2'
    });
  }

  /**
   * Example: Generic REST API call with authentication
   */
  authenticatedExternalCall<T>(
    url: string,
    token: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Observable<ApiResponse<T>> {
    return this.callExternalApi<T>(url, method, data, {
      baseUrl: '',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Example: File upload to external service
   */
  uploadToExternalService<T>(
    url: string,
    file: File,
    apiKey?: string,
    additionalData?: any
  ): Observable<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers: any = {};
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    return this.apiService.external<T>(url, 'POST', formData, headers);
  }
}
