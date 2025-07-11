import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Observable, filter, map } from 'rxjs';
import { AppStateService, NavigationState, BreadcrumbItem } from './app-state.service';
import { Location } from '@angular/common';

export interface RouteData {
  title?: string;
  description?: string;
  keywords?: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private appStateService: AppStateService
  ) {
    this.initializeNavigationTracking();
  }

  /**
   * Get current navigation state
   */
  get navigationState$(): Observable<NavigationState> {
    return this.appStateService.navigation$;
  }

  /**
   * Get current route observable
   */
  get currentRoute$(): Observable<string> {
    return this.navigationState$.pipe(
      map(nav => nav.currentRoute)
    );
  }

  /**
   * Get breadcrumbs observable
   */
  get breadcrumbs$(): Observable<BreadcrumbItem[]> {
    return this.navigationState$.pipe(
      map(nav => nav.breadcrumbs)
    );
  }

  /**
   * Get navigation status
   */
  get isNavigating$(): Observable<boolean> {
    return this.navigationState$.pipe(
      map(nav => nav.isNavigating)
    );
  }

  /**
   * Navigate to a route
   */
  async navigateTo(route: string | string[], extras?: any): Promise<boolean> {
    this.appStateService.setNavigating(true);
    
    try {
      const result = await this.router.navigate(Array.isArray(route) ? route : [route], extras);
      return result;
    } finally {
      // Reset navigation state after a delay to show loading indicator
      setTimeout(() => {
        this.appStateService.setNavigating(false);
      }, 300);
    }
  }

  /**
   * Navigate to route with state
   */
  async navigateWithState(route: string, state: any): Promise<boolean> {
    return this.navigateTo(route, { state });
  }

  /**
   * Navigate back
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Navigate forward
   */
  goForward(): void {
    this.location.forward();
  }

  /**
   * Replace current route
   */
  async replaceRoute(route: string | string[], extras?: any): Promise<boolean> {
    return this.router.navigate(
      Array.isArray(route) ? route : [route], 
      { ...extras, replaceUrl: true }
    );
  }

  /**
   * Navigate to home
   */
  async navigateToHome(): Promise<boolean> {
    return this.navigateTo('/');
  }

  /**
   * Navigate to demo
   */
  async navigateToDemo(): Promise<boolean> {
    return this.navigateTo('/demo');
  }

  /**
   * Get current route data
   */
  getCurrentRouteData(): RouteData {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data as RouteData;
  }

  /**
   * Get current route parameters
   */
  getCurrentRouteParams(): { [key: string]: any } {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.params;
  }

  /**
   * Get current query parameters
   */
  getCurrentQueryParams(): { [key: string]: any } {
    return this.activatedRoute.snapshot.queryParams;
  }

  /**
   * Update query parameters without navigation
   */
  updateQueryParams(params: { [key: string]: any }): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Clear all query parameters
   */
  clearQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {}
    });
  }

  /**
   * Check if route is active
   */
  isRouteActive(route: string): boolean {
    return this.router.isActive(route, { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  }

  /**
   * Check if route starts with path
   */
  isRouteActivePartial(route: string): boolean {
    return this.router.isActive(route, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  }

  /**
   * Generate breadcrumbs from route
   */
  private generateBreadcrumbs(url: string, routeData?: RouteData): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', route: '/', icon: 'home' }
    ];

    if (url === '/') {
      return breadcrumbs;
    }

    // Parse route segments
    const segments = url.split('/').filter(segment => segment);
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Get route configuration for this path
      const routeConfig = this.getRouteConfig(currentPath);
      
      let label = routeConfig?.title || this.formatSegmentLabel(segment);
      let icon = routeConfig?.icon;
      
      // Use route data for the final segment if available
      if (index === segments.length - 1 && routeData) {
        label = routeData.title || label;
        icon = routeData.icon || icon;
      }

      breadcrumbs.push({
        label,
        route: currentPath,
        icon
      });
    });

    return breadcrumbs;
  }

  /**
   * Get route configuration (would be enhanced with actual route config)
   */
  private getRouteConfig(path: string): RouteData | undefined {
    // This would ideally come from your route configuration
    const routeConfigs: Record<string, RouteData> = {
      '/': { title: 'Home', icon: 'home' },
      '/demo': { title: 'Meta Tags Demo', icon: 'settings' },
      '/about': { title: 'About', icon: 'info' },
      '/contact': { title: 'Contact', icon: 'mail' }
    };

    return routeConfigs[path];
  }

  /**
   * Format segment label (convert kebab-case to Title Case)
   */
  private formatSegmentLabel(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Initialize navigation tracking
   */
  private initializeNavigationTracking(): void {
    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const routeData = this.getCurrentRouteData();
      const breadcrumbs = this.generateBreadcrumbs(event.urlAfterRedirects, routeData);
      
      this.appStateService.setCurrentRoute(event.urlAfterRedirects, routeData.title);
      
      // Update breadcrumbs by setting current route with breadcrumbs
      const currentNav = this.appStateService.getCurrentState().navigation;
      const newNav = {
        ...currentNav,
        breadcrumbs
      };
      
      // Update navigation state with new breadcrumbs
      this.appStateService.updateNavigationState(newNav);

      // Reset navigation loading state
      this.appStateService.setNavigating(false);
    });

    // Track navigation start
    this.router.events.pipe(
      filter(event => event.constructor.name === 'NavigationStart')
    ).subscribe(() => {
      this.appStateService.setNavigating(true);
    });
  }

  /**
   * Get navigation history (simplified - would need more sophisticated tracking)
   */
  getNavigationHistory(): string[] {
    const currentNav = this.appStateService.getCurrentState().navigation;
    const history = [currentNav.currentRoute];
    
    if (currentNav.previousRoute) {
      history.unshift(currentNav.previousRoute);
    }
    
    return history;
  }

  /**
   * Can navigate back
   */
  canGoBack(): boolean {
    const currentNav = this.appStateService.getCurrentState().navigation;
    return currentNav.previousRoute !== null;
  }

  /**
   * Get route tree for navigation menus
   */
  getRouteTree(): any[] {
    // This would ideally be generated from your route configuration
    return [
      {
        path: '/',
        label: 'Home',
        icon: 'home',
        children: []
      },
      {
        path: '/demo',
        label: 'Meta Tags Demo',
        icon: 'settings',
        children: []
      }
    ];
  }

  /**
   * Bookmark current route
   */
  bookmarkCurrentRoute(): void {
    const currentRoute = this.appStateService.getCurrentState().navigation.currentRoute;
    const routeData = this.getCurrentRouteData();
    
    // Store bookmark (would integrate with a bookmark service)
    const bookmark = {
      url: currentRoute,
      title: routeData.title || 'Untitled',
      timestamp: new Date()
    };
    
    console.log('Bookmarked:', bookmark);
    // Here you would save to a bookmarks service or local storage
  }
}
