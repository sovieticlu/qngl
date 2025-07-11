import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ViewportService, ViewportState } from '../../services/viewport.service';
import { User } from '../../services/app-state.service';
import { MainHeaderComponent } from './main-header/main-header.component';
import { MainSiderComponent } from './main-sider/main-sider.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MainHeaderComponent,
    MainSiderComponent
  ],
  template: `
    <div class="main-layout" [class]="layoutClasses$ | async">
      <!-- Header -->
      <app-main-header 
        [currentUser]="currentUser$ | async"
        [isAuthenticated]="isAuthenticated$ | async"
        [isMobileSidebarOpen]="isMobileSidebarOpen"
        [viewportState]="viewportState$ | async"
        (logout)="handleLogout()"
        (navigateToLogin)="navigateToLogin()"
        (navigateToRegister)="navigateToRegister()"
        (toggleMobileSidebar)="toggleMobileSidebar()">
      </app-main-header>

      <div class="layout-container">
        <!-- Sidebar -->
        <app-main-sider 
          [currentUser]="currentUser$ | async"
          [isAuthenticated]="isAuthenticated$ | async"
          [isMobileOpen]="isMobileSidebarOpen"
          [viewportState]="viewportState$ | async"
          [isCollapsed]="isSidebarCollapsed"
          (closeMobile)="closeMobileSidebar()"
          (toggleCollapsed)="toggleSidebarCollapsed()">
        </app-main-sider>

        <!-- Main Content Area -->
        <main class="main-content" [class.sidebar-collapsed]="isSidebarCollapsed && !isMobile">
          <div class="content-wrapper">
            <!-- This is where child routes will be rendered -->
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Mobile Sidebar Backdrop -->
      <div 
        class="mobile-backdrop" 
        [class.active]="isMobileSidebarOpen && isMobile"
        (click)="closeMobileSidebar()">
      </div>

      <!-- Debug info for mobile sidebar (remove in production) -->
      <div class="debug-info" 
           style="position: fixed; top: 70px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 5px; font-size: 12px; z-index: 9999; border-radius: 4px;"
           *ngIf="(viewportState$ | async)?.isMobile">
        Mobile: {{ (viewportState$ | async)?.isMobile }}<br>
        Sidebar Open: {{ isMobileSidebarOpen }}<br>
        Device: {{ (viewportState$ | async)?.deviceType }}<br>
        Width: {{ (viewportState$ | async)?.width }}px
      </div>

      <!-- Test Mobile Sidebar Button (remove after testing) -->
      <div class="mobile-test-controls" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
        <button 
          (click)="toggleMobileSidebar()"
          style="background: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 6px; font-size: 14px; cursor: pointer; margin-bottom: 5px; display: block; width: 100%;">
          {{ isMobileSidebarOpen ? 'Close' : 'Open' }} Sidebar
        </button>
        <div style="background: rgba(0,0,0,0.8); color: white; padding: 5px; border-radius: 4px; font-size: 12px; text-align: center;">
          Mobile: {{ (viewportState$ | async)?.isMobile }}<br>
          Open: {{ isMobileSidebarOpen }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  viewportState$: Observable<ViewportState>;
  isMobile$: Observable<boolean>;
  layoutClasses$: Observable<string>;
  
  private subscriptions = new Subscription();
  isMobileSidebarOpen = false;
  isSidebarCollapsed = false;
  isMobile = false;

  constructor(
    private authService: AuthService,
    private viewportService: ViewportService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.viewportState$ = this.viewportService.viewportState$;
    this.isMobile$ = this.viewportService.isMobile$;
    
    // Create layout classes based on viewport state
    this.layoutClasses$ = this.viewportState$.pipe(
      map(state => {
        const classes = [
          `device-${state.deviceType}`,
          `orientation-${state.orientation}`,
          state.isTouch ? 'touch' : 'no-touch'
        ];
        if (this.isSidebarCollapsed && !state.isMobile) {
          classes.push('sidebar-collapsed');
        }
        return classes.join(' ');
      })
    );
  }

  ngOnInit(): void {
    // Subscribe to mobile state changes
    this.subscriptions.add(
      this.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
        // Auto-close mobile sidebar when switching to desktop
        if (!isMobile && this.isMobileSidebarOpen) {
          this.isMobileSidebarOpen = false;
        }
        // Auto-expand sidebar on desktop if it was collapsed
        if (!isMobile && this.isSidebarCollapsed) {
          this.isSidebarCollapsed = false;
        }
      })
    );

    // Subscribe to viewport changes to auto-handle responsive behavior
    this.subscriptions.add(
      this.viewportState$.subscribe(state => {
        // Handle responsive sidebar behavior
        if (state.isMobile && !this.isSidebarCollapsed) {
          // On mobile, sidebar should be hidden by default
          this.isMobileSidebarOpen = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async handleLogout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  toggleMobileSidebar(): void {
    console.log('Toggle mobile sidebar called. Current state:', this.isMobileSidebarOpen);
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    console.log('New state:', this.isMobileSidebarOpen);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  toggleSidebarCollapsed(): void {
    // Only allow sidebar collapse on desktop/big screens
    if (!this.isMobile) {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }
}
