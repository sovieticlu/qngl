import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../../../services/app-state.service';
import { ViewportState } from '../../../services/viewport.service';

@Component({
  selector: 'app-main-sider',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <aside class="main-sider" 
           [class.authenticated]="isAuthenticated"
           [class.open]="isMobileOpen"
           [class.collapsed]="isCollapsed && !isMobile"
           [class]="'device-' + (viewportState?.deviceType || 'desktop')">
      <div class="sider-content">
        
        <!-- Collapse Toggle Button (Desktop only) -->
        <button class="collapse-toggle" 
                *ngIf="!isMobile && isAuthenticated"
                (click)="toggleCollapsed.emit()"
                [title]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <span class="toggle-icon">{{ isCollapsed ? '▶' : '◀' }}</span>
        </button>

        <!-- User Profile Section -->
        <div class="user-profile" *ngIf="isAuthenticated && currentUser && !isCollapsed">
          <div class="profile-header">
            <div class="profile-avatar">
              <img [src]="currentUser.avatar || '/assets/default-avatar.svg'" 
                   [alt]="getUserDisplayName(currentUser)" 
                   [title]="getUserDisplayName(currentUser)" 
                   class="avatar-img">
            </div>
            <div class="profile-info" *ngIf="!isMobile || isMobileOpen">
              <h3 class="profile-name">{{ getUserDisplayName(currentUser) }}</h3>
              <span class="profile-role" [class.admin]="isAdmin(currentUser)">
                {{ currentUser.role }}
              </span>
            </div>
          </div>
        </div>

        <!-- Collapsed User Avatar (when sidebar is collapsed) -->
        <div class="collapsed-user" *ngIf="isAuthenticated && currentUser && isCollapsed && !isMobile">
          <div class="collapsed-avatar">
            <img [src]="currentUser.avatar || '/assets/default-avatar.svg'" 
                 [alt]="getUserDisplayName(currentUser)" 
                 [title]="getUserDisplayName(currentUser)" 
                 class="avatar-img">
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="sider-nav">
          <div class="nav-section">
            <h4 class="nav-section-title">Main</h4>
            <ul class="nav-menu">
              <li class="nav-item">
                <a routerLink="/" 
                   routerLinkActive="active" 
                   [routerLinkActiveOptions]="{exact: true}" 
                   class="nav-link"
                   (click)="onNavLinkClick()">
                  <span class="nav-icon">🏠</span>
                  <span class="nav-text">Home</span>
                </a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated">
                <a routerLink="/dashboard" 
                   routerLinkActive="active" 
                   class="nav-link"
                   (click)="onNavLinkClick()">
                  <span class="nav-icon">📊</span>
                  <span class="nav-text">Dashboard</span>
                </a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated">
                <a routerLink="/demo" 
                   routerLinkActive="active" 
                   class="nav-link"
                   (click)="onNavLinkClick()">
                  <span class="nav-icon">🏷️</span>
                  <span class="nav-text">Meta Demo</span>
                </a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated">
                <a routerLink="/responsive" 
                   routerLinkActive="active" 
                   class="nav-link"
                   (click)="onNavLinkClick()">
                  <span class="nav-icon">📱</span>
                  <span class="nav-text">Responsive Demo</span>
                </a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated">
                <a routerLink="/services" 
                   routerLinkActive="active" 
                   class="nav-link"
                   (click)="onNavLinkClick()">
                  <span class="nav-icon">🚀</span>
                  <span class="nav-text">Services Demo</span>
                </a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated">
                <a routerLink="/api-demo" 
                   routerLinkActive="active" 
                   class="nav-link"
                   (click)="onNavLinkClick()">
                  <span class="nav-icon">🔌</span>
                  <span class="nav-text">API Demo</span>
                </a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated">
                <a routerLink="/forms-demo" 
                   routerLinkActive="active" 
                   class="nav-link"
                   (click)="onNavLinkClick()">
                  <span class="nav-icon">📝</span>
                  <span class="nav-text">Forms Demo</span>
                </a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated">
                <a routerLink="/elasticsearch-visualizer" 
                   routerLinkActive="active" 
                   class="nav-link"
                   (click)="onNavLinkClick()">
                  <span class="nav-icon">🔍</span>
                  <span class="nav-text">Elasticsearch Visualizer</span>
                </a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated">
                <a routerLink="/elasticsearch-filter" 
                   routerLinkActive="active" 
                   class="nav-link"
                   (click)="onNavLinkClick()">
                  <span class="nav-icon">🧩</span>
                  <span class="nav-text">Elasticsearch Filter</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Admin Section -->
          <div class="nav-section" *ngIf="isAuthenticated && currentUser && isAdmin(currentUser)">
            <h4 class="nav-section-title">Administration</h4>
            <ul class="nav-menu">
              <li class="nav-item">
                <a routerLink="/admin" routerLinkActive="active" class="nav-link">
                  <span class="nav-icon">⚙️</span>
                  <span class="nav-text">Admin Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
                  <span class="nav-icon">👥</span>
                  <span class="nav-text">User Management</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/admin/settings" routerLinkActive="active" class="nav-link">
                  <span class="nav-icon">🔧</span>
                  <span class="nav-text">Settings</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Quick Actions -->
          <div class="nav-section" *ngIf="isAuthenticated">
            <h4 class="nav-section-title">Quick Actions</h4>
            <ul class="nav-menu">
              <li class="nav-item">
                <a routerLink="/profile" routerLinkActive="active" class="nav-link">
                  <span class="nav-icon">👤</span>
                  <span class="nav-text">Profile</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/settings" routerLinkActive="active" class="nav-link">
                  <span class="nav-icon">⚙️</span>
                  <span class="nav-text">Settings</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Footer -->
        <div class="sider-footer">
          <div class="footer-info">
            <p class="app-version">SocialVariant v1.0.0</p>
            <p class="copyright">&copy; 2025</p>
          </div>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./main-sider.component.scss']
})
export class MainSiderComponent {
  @Input() currentUser: User | null = null;
  @Input() isAuthenticated: boolean | null = false;
  @Input() isMobileOpen: boolean = false;
  @Input() viewportState: ViewportState | null = null;
  @Input() isCollapsed: boolean = false;
  
  @Output() closeMobile = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  get isMobile(): boolean {
    return this.viewportState?.isMobile ?? false;
  }

  get isTablet(): boolean {
    return this.viewportState?.isTablet ?? false;
  }

  getUserDisplayName(user: User | null): string {
    if (!user) return '';
    return user.name || user.email;
  }

  isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
  }

  onNavLinkClick(): void {
    // Close mobile sidebar when a link is clicked
    if (this.isMobile || this.isTablet) {
      this.closeMobile.emit();
    }
  }
}
