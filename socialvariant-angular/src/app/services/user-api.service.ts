import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  constructor(private apiService: ApiService) {}

  /**
   * Get all users with pagination
   */
  getUsers(page = 1, limit = 10, search?: string): Observable<ApiResponse<UserListResponse>> {
    const params: any = { page, limit };
    if (search) {
      params.search = search;
    }
    return this.apiService.get<UserListResponse>('/users', params);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.apiService.get<User>(`/users/${id}`);
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.apiService.get<User>('/users/me');
  }

  /**
   * Create a new user
   */
  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.apiService.post<User>('/users', userData);
  }

  /**
   * Update user
   */
  updateUser(id: string, userData: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.apiService.put<User>(`/users/${id}`, userData);
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`/users/${id}`);
  }

  /**
   * Upload user avatar
   */
  uploadAvatar(userId: string, file: File): Observable<ApiResponse<{ avatarUrl: string }>> {
    return this.apiService.upload<{ avatarUrl: string }>(`/users/${userId}/avatar`, file);
  }

  /**
   * Search users
   */
  searchUsers(query: string, filters?: any): Observable<ApiResponse<User[]>> {
    const params = { q: query, ...filters };
    return this.apiService.get<User[]>('/users/search', params);
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string): Observable<ApiResponse<any>> {
    return this.apiService.get<any>(`/users/${userId}/stats`);
  }
}
