# API Service Documentation

This document describes the comprehensive API service architecture for the SocialVariant Angular application.

## Overview

The API service provides a unified interface for making HTTP requests to both backend APIs and external third-party APIs. It includes features like automatic error handling, loading states, authentication, retry logic, and request/response interceptors.

## Core Services

### 1. ApiService (`api.service.ts`)

The main service that provides core HTTP functionality.

#### Features:

- Generic HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Automatic error handling and retry logic
- Loading state management
- File upload support
- External API integration
- Configurable timeouts and headers
- Authentication token management

#### Usage Example:

```typescript
import { ApiService } from './services/api.service';

constructor(private apiService: ApiService) {}

// GET request
this.apiService.get<User[]>('/users').subscribe(response => {
  if (response.success) {
    console.log('Users:', response.data);
  }
});

// POST request
this.apiService.post<User>('/users', userData).subscribe(response => {
  if (response.success) {
    console.log('User created:', response.data);
  }
});

// File upload
this.apiService.upload<{url: string}>('/upload', file).subscribe(response => {
  if (response.success) {
    console.log('File uploaded:', response.data.url);
  }
});
```

### 2. UserApiService (`user-api.service.ts`)

Specialized service for user-related API operations.

#### Methods:

- `getUsers(page, limit, search)` - Get paginated users list
- `getUserById(id)` - Get specific user
- `getCurrentUser()` - Get current user profile
- `createUser(userData)` - Create new user
- `updateUser(id, userData)` - Update user
- `deleteUser(id)` - Delete user
- `uploadAvatar(userId, file)` - Upload user avatar
- `searchUsers(query, filters)` - Search users
- `getUserStats(userId)` - Get user statistics

#### Usage Example:

```typescript
import { UserApiService } from './services/user-api.service';

constructor(private userApi: UserApiService) {}

// Load users with pagination
this.userApi.getUsers(1, 10).subscribe(response => {
  if (response.success) {
    this.users = response.data.users;
  }
});

// Create user
const userData = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securepassword'
};

this.userApi.createUser(userData).subscribe(response => {
  if (response.success) {
    console.log('User created successfully');
  }
});
```

### 3. ExternalApiService (`external-api.service.ts`)

Service for integrating with external third-party APIs.

#### Features:

- Generic external API calls
- Pre-configured integrations (GitHub, Weather, News APIs)
- API key management
- Custom headers and authentication

#### Usage Example:

```typescript
import { ExternalApiService } from './services/external-api.service';

constructor(private externalApi: ExternalApiService) {}

// GitHub API
this.externalApi.getGitHubUser('username').subscribe(response => {
  if (response.success) {
    console.log('GitHub user:', response.data);
  }
});

// Custom external API
this.externalApi.callExternalApi(
  'https://api.example.com/data',
  'GET',
  null,
  {
    headers: { 'Authorization': 'Bearer token' }
  }
).subscribe(response => {
  console.log('External data:', response.data);
});
```

### 4. ApiInterceptor (`api.interceptor.ts`)

HTTP interceptor that automatically handles:

- Authentication token injection
- Request/response logging
- Error handling and user notifications
- Common headers

## Configuration

### Environment Setup

The API service uses environment configuration:

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  external: {
    githubApi: "https://api.github.com",
    weatherApi: "https://api.openweathermap.org/data/2.5",
  },
};
```

### Service Configuration

```typescript
// Update API configuration
this.apiService.updateConfig({
  baseUrl: "https://new-api.com",
  timeout: 45000,
  retries: 5,
});

// Set authentication token
this.apiService.setAuthToken("your-jwt-token");

// Remove authentication
this.apiService.removeAuthToken();
```

## Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}
```

## Error Handling

The service provides comprehensive error handling:

- Network errors
- HTTP status code errors (401, 403, 404, 500, etc.)
- Timeout errors
- Parsing errors

Errors are automatically logged and can trigger user notifications through the interceptor.

## Loading States

The API service provides a loading state observable:

```typescript
// Subscribe to loading state
this.apiService.loading$.subscribe((isLoading) => {
  this.showSpinner = isLoading;
});

// Check current loading state
const isLoading = this.apiService.isLoading();
```

## File Uploads

The service supports file uploads with additional form data:

```typescript
// Simple file upload
this.apiService.upload("/upload", file).subscribe((response) => {
  console.log("Upload response:", response);
});

// Upload with additional data
this.userApi.uploadAvatar(userId, file).subscribe((response) => {
  if (response.success) {
    console.log("Avatar uploaded:", response.data.avatarUrl);
  }
});
```

## Best Practices

### 1. Error Handling

Always handle both success and error cases:

```typescript
this.apiService.get("/data").subscribe({
  next: (response) => {
    if (response.success) {
      // Handle success
    } else {
      // Handle API error
    }
  },
  error: (error) => {
    // Handle HTTP error
  },
});
```

### 2. Unsubscription

Use takeUntil pattern to prevent memory leaks:

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.apiService.get('/data')
    .pipe(takeUntil(this.destroy$))
    .subscribe(response => {
      // Handle response
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 3. Loading States

Show loading indicators for better UX:

```typescript
// Component template
<button [nzLoading]="loading" (click)="loadData()">Load Data</button>

// Component code
loadData() {
  this.apiService.get('/data')
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        // Handle response
      }
    });
}
```

## Demo Component

A complete demo component (`api-demo.component.ts`) is provided that showcases:

- Backend API calls (CRUD operations)
- External API integration
- File upload functionality
- Error and success handling
- Loading states

## Integration with App

The API services are automatically configured in `app.config.ts` with the HTTP interceptor for seamless integration.

## Security Considerations

1. **Authentication**: Tokens are automatically injected via interceptor
2. **HTTPS**: Always use HTTPS in production
3. **API Keys**: Store sensitive keys in environment variables
4. **CORS**: Configure CORS properly on your backend
5. **Rate Limiting**: Implement rate limiting for external APIs

## Testing

Create unit tests for your API services:

```typescript
describe("ApiService", () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should make GET request", () => {
    const mockData = { id: 1, name: "Test" };

    service.get("/test").subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
    });

    const req = httpMock.expectOne("/api/test");
    expect(req.request.method).toBe("GET");
    req.flush(mockData);
  });
});
```

This API service architecture provides a robust foundation for all HTTP communication in your Angular application, supporting both backend integration and external API consumption with proper error handling, loading states, and security features.
