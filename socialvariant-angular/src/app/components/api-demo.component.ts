import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../services/api.service';
import { UserApiService, User } from '../services/user-api.service';
import { ExternalApiService } from '../services/external-api.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-api-demo',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzListModule,
    NzSpinModule,
    NzAlertModule,
    NzDividerModule
  ],
  template: `
    <div class="api-demo-container">
      <nz-card nzTitle="API Service Demo" class="demo-card">
        <div class="demo-section">
          <h3>Backend API Calls</h3>
          <button nz-button nzType="primary" (click)="loadUsers()" [nzLoading]="loading">
            Load Users
          </button>
          <button nz-button (click)="createSampleUser()" [nzLoading]="loading">
            Create Sample User
          </button>
          
          <nz-divider></nz-divider>
          
          <div *ngIf="users.length > 0">
            <h4>Users:</h4>
            <nz-list [nzDataSource]="users" [nzLoading]="loading">
              <ng-template #item let-user>
                <nz-list-item>
                  <div>
                    <strong>{{ user.username }}</strong> - {{ user.email }}
                    <br>
                    <small>Role: {{ user.role }} | Active: {{ user.isActive ? 'Yes' : 'No' }}</small>
                  </div>
                  <div nz-list-item-actions>
                    <button nz-button nzSize="small" (click)="updateUser(user.id)">Edit</button>
                    <button nz-button nzDanger nzSize="small" (click)="deleteUser(user.id)">Delete</button>
                  </div>
                </nz-list-item>
              </ng-template>
            </nz-list>
          </div>
        </div>

        <nz-divider></nz-divider>

        <div class="demo-section">
          <h3>External API Calls</h3>
          <button nz-button nzType="primary" (click)="loadGitHubData()" [nzLoading]="loading">
            Load GitHub Data
          </button>
          <button nz-button (click)="loadJsonPlaceholderPosts()" [nzLoading]="loading">
            Load Sample Posts
          </button>
          
          <div *ngIf="externalData">
            <h4>External Data:</h4>
            <pre>{{ externalData | json }}</pre>
          </div>
        </div>

        <nz-divider></nz-divider>

        <div class="demo-section">
          <h3>File Upload</h3>
          <input type="file" (change)="onFileSelected($event)" accept="image/*">
          <button nz-button [disabled]="!selectedFile" (click)="uploadFile()" [nzLoading]="loading">
            Upload File
          </button>
        </div>

        <div *ngIf="error" class="error-section">
          <nz-alert nzType="error" [nzMessage]="error" nzCloseable (nzOnClose)="clearError()"></nz-alert>
        </div>

        <div *ngIf="success" class="success-section">
          <nz-alert nzType="success" [nzMessage]="success" nzCloseable (nzOnClose)="clearSuccess()"></nz-alert>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .api-demo-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-card {
      margin-bottom: 20px;
    }

    .demo-section {
      margin-bottom: 20px;
    }

    .demo-section button {
      margin-right: 10px;
      margin-bottom: 10px;
    }

    .error-section,
    .success-section {
      margin-top: 20px;
    }

    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      max-height: 300px;
      overflow-y: auto;
    }

    h3 {
      color: #1890ff;
      margin-bottom: 15px;
    }

    h4 {
      margin-top: 20px;
      margin-bottom: 10px;
    }
  `]
})
export class ApiDemoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  users: User[] = [];
  externalData: any = null;
  selectedFile: File | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private apiService: ApiService,
    private userApiService: UserApiService,
    private externalApiService: ExternalApiService
  ) {}

  ngOnInit(): void {
    // Subscribe to loading state
    this.apiService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.clearMessages();
    this.userApiService.getUsers(1, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.users = response.data.users;
            this.success = `Loaded ${this.users.length} users successfully`;
          }
        },
        error: (error) => {
          this.error = error.error || 'Failed to load users';
        }
      });
  }

  createSampleUser(): void {
    this.clearMessages();
    const userData = {
      username: `user_${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Sample',
      lastName: 'User'
    };

    this.userApiService.createUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'User created successfully';
            this.loadUsers(); // Reload users list
          }
        },
        error: (error) => {
          this.error = error.error || 'Failed to create user';
        }
      });
  }

  updateUser(userId: string): void {
    this.clearMessages();
    const updateData = {
      firstName: 'Updated',
      lastName: 'User'
    };

    this.userApiService.updateUser(userId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'User updated successfully';
            this.loadUsers(); // Reload users list
          }
        },
        error: (error) => {
          this.error = error.error || 'Failed to update user';
        }
      });
  }

  deleteUser(userId: string): void {
    this.clearMessages();
    this.userApiService.deleteUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'User deleted successfully';
            this.loadUsers(); // Reload users list
          }
        },
        error: (error) => {
          this.error = error.error || 'Failed to delete user';
        }
      });
  }

  loadGitHubData(): void {
    this.clearMessages();
    this.externalApiService.getGitHubUser('octocat')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.externalData = response.data;
            this.success = 'GitHub data loaded successfully';
          }
        },
        error: (error) => {
          this.error = error.error || 'Failed to load GitHub data';
        }
      });
  }

  loadJsonPlaceholderPosts(): void {
    this.clearMessages();
    this.externalApiService.getJsonPlaceholderPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Show only first 5 posts for demo
            this.externalData = response.data?.slice(0, 5);
            this.success = 'Sample posts loaded successfully';
          }
        },
        error: (error) => {
          this.error = error.error || 'Failed to load sample posts';
        }
      });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.clearMessages();
    this.userApiService.uploadAvatar('current-user-id', this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'File uploaded successfully';
            this.selectedFile = null;
          }
        },
        error: (error) => {
          this.error = error.error || 'Failed to upload file';
        }
      });
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  clearError(): void {
    this.error = null;
  }

  clearSuccess(): void {
    this.success = null;
  }
}
