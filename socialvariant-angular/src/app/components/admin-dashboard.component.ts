import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DocumentHeadService } from '../services/document-head.service';
import { LanguageService } from '../services/language.service';
import { Observable } from 'rxjs';
import { User } from '../services/app-state.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-dashboard">
      <div class="container">
        <header class="admin-header">
          <h1>{{ translate('admin.dashboard_title') }}</h1>
          <p class="welcome-message" *ngIf="currentUser$ | async as user">
            {{ translate('admin.welcome_admin') }}, {{ user.name }}!
          </p>
        </header>

        <div class="admin-nav">
          <nav class="nav-pills">
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-pill">
              📊 {{ translate('admin.dashboard') }}
            </a>
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-pill">
              👥 {{ translate('admin.users') }}
            </a>
            <a routerLink="/admin/settings" routerLinkActive="active" class="nav-pill">
              ⚙️ {{ translate('admin.settings') }}
            </a>
          </nav>
        </div>

        <div class="admin-content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <h3>{{ userStats.total }}</h3>
                <p>{{ translate('admin.total_users') }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🟢</div>
              <div class="stat-content">
                <h3>{{ userStats.active }}</h3>
                <p>{{ translate('admin.active_users') }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👑</div>
              <div class="stat-content">
                <h3>{{ userStats.admins }}</h3>
                <p>{{ translate('admin.admin_users') }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <h3>{{ userStats.newToday }}</h3>
                <p>{{ translate('admin.new_today') }}</p>
              </div>
            </div>
          </div>

          <div class="recent-activity">
            <h2>{{ translate('admin.recent_activity') }}</h2>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let activity of recentActivity">
                <div class="activity-icon">{{ activity.icon }}</div>
                <div class="activity-content">
                  <p>{{ activity.description }}</p>
                  <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <h2>{{ translate('admin.quick_actions') }}</h2>
            <div class="action-buttons">
              <button class="action-btn primary" (click)="navigateToUsers()">
                👥 {{ translate('admin.manage_users') }}
              </button>
              <button class="action-btn secondary" (click)="navigateToSettings()">
                ⚙️ {{ translate('admin.system_settings') }}
              </button>
              <button class="action-btn warning" (click)="viewSystemLogs()">
                📋 {{ translate('admin.view_logs') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;
  
  userStats = {
    total: 1247,
    active: 892,
    admins: 3,
    newToday: 12
  };

  recentActivity = [
    {
      icon: '👤',
      description: 'New user registered: john.doe@example.com',
      timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    },
    {
      icon: '🔧',
      description: 'System settings updated by admin',
      timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    },
    {
      icon: '🚫',
      description: 'User account suspended: spam.user@example.com',
      timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      icon: '🎯',
      description: 'Database backup completed successfully',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    }
  ];

  constructor(
    private authService: AuthService,
    private documentHeadService: DocumentHeadService,
    private languageService: LanguageService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Set page meta tags
    this.documentHeadService.updateHead({
      title: this.translate('admin.dashboard_title'),
      description: this.translate('admin.dashboard_description'),
      keywords: 'admin, dashboard, management, statistics, SocialVariant',
      robots: 'noindex,nofollow' // Admin pages should not be indexed
    });
  }

  navigateToUsers(): void {
    window.location.href = '/admin/users';
  }

  navigateToSettings(): void {
    window.location.href = '/admin/settings';
  }

  viewSystemLogs(): void {
    // Mock action - in real app would open logs modal or navigate to logs page
    alert(this.translate('admin.feature_coming_soon'));
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }
}
