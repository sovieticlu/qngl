import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { ElasticsearchVisualizerComponent } from './components/elasticsearch-visualizer.component';
import { PageExampleComponent } from './components/page-example.component';
import { ResponsiveDemoComponent } from './components/responsive-demo.component';
import { ServicesDemoComponent } from './components/services-demo.component';
import { ApiDemoComponent } from './components/api-demo.component';
import { FormsDemoComponent } from './components/forms/forms-demo.component';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { authGuard, guestGuard, adminGuard } from './guards/auth.guard';
import { ElasticsearchFilterComponent } from './components/elasticsearch-filter.component';

export const routes: Routes = [
  // Authentication routes (with auth layout)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes)
      }
    ]
  },
  
  // Main application routes (with layout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
        title: 'Home - SocialVariant',
        data: {
          description: 'Welcome to SocialVariant - Your social platform dashboard',
          keywords: 'home, dashboard, social platform, SocialVariant'
        }
      },
      {
        path: 'dashboard',
        component: HomeComponent, // For now, use the same component
        title: 'Dashboard - SocialVariant',
        data: {
          description: 'Your personal dashboard on SocialVariant',
          keywords: 'dashboard, personal, overview, SocialVariant'
        }
      },
      {
        path: 'demo',
        component: PageExampleComponent,
        title: 'Meta Tags Demo - SocialVariant',
        data: {
          description: 'Demonstration of dynamic meta tags implementation',
          keywords: 'demo, meta tags, SEO, social media, SocialVariant'
        }
      },
      {
        path: 'responsive',
        component: ResponsiveDemoComponent,
        title: 'Responsive Demo - SocialVariant',
        data: {
          description: 'Demonstration of responsive viewport service and adaptive UI',
          keywords: 'responsive, viewport, mobile, tablet, desktop, adaptive UI, SocialVariant'
        }
      },
      {
        path: 'services',
        component: ServicesDemoComponent,
        title: 'Services Demo - SocialVariant',
        data: {
          description: 'Demonstration of all services with store dispatch patterns',
          keywords: 'services, store, theme, language, PWA, night mode, demo, SocialVariant'
        }
      },
      {
        path: 'api-demo',
        component: ApiDemoComponent,
        title: 'API Demo - SocialVariant',
        data: {
          description: 'Demonstration of API service functionality for backend and external API calls',
          keywords: 'API, demo, backend, external, HTTP, services, SocialVariant'
        }
      },
      {
        path: 'forms-demo',
        component: FormsDemoComponent,
        title: 'Forms Demo - SocialVariant',
        data: {
          description: 'Advanced reusable forms with validation, auto-save, and change tracking',
          keywords: 'forms, validation, auto-save, reactive forms, reusable components, SocialVariant'
        }
      }
      ,
      {
        path: 'elasticsearch-visualizer',
        component: ElasticsearchVisualizerComponent,
        title: 'Elasticsearch Visualizer',
        data: {
          description: 'Visualize and run queries against your Elasticsearch cluster',
          keywords: 'elasticsearch, visualizer, query, search, SocialVariant'
        }
      }
      ,
      {
        path: 'elasticsearch-filter',
        component: ElasticsearchFilterComponent,
        title: 'Elasticsearch Filter',
        data: {
          description: 'Visualize and run queries against your Elasticsearch cluster',
          keywords: 'elasticsearch, visualizer, query, search, SocialVariant'
        }
      }
    ]
  },
  
  // Admin routes (with layout and admin guard)
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
      }
    ]
  },

  // Redirect legacy routes
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: '/auth/register',
    pathMatch: 'full'
  },
  {
    path: 'home',
    redirectTo: '/',
    pathMatch: 'full'
  },
  
  // Fallback route
  {
    path: '**',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }
];
