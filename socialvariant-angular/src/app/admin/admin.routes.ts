import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../components/admin-dashboard.component.js';
import { AdminUsersComponent } from '../components/admin-users.component.js';
import { AdminSettingsComponent } from '../components/admin-settings.component.js';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    title: 'Admin Dashboard - SocialVariant',
    data: {
      description: 'Administrative dashboard for SocialVariant platform management',
      keywords: 'admin, dashboard, management, SocialVariant'
    }
  },
  {
    path: 'users',
    component: AdminUsersComponent,
    title: 'User Management - SocialVariant Admin',
    data: {
      description: 'Manage user accounts and permissions',
      keywords: 'admin, users, management, accounts, SocialVariant'
    }
  },
  {
    path: 'settings',
    component: AdminSettingsComponent,
    title: 'Admin Settings - SocialVariant',
    data: {
      description: 'Configure platform settings and preferences',
      keywords: 'admin, settings, configuration, SocialVariant'
    }
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
