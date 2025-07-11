import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { map, startWith, distinctUntilChanged, shareReplay } from 'rxjs/operators';

export interface ViewportBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  bigScreen: number;
  ultraWide: number;
  ultraUltraWide: number;
}

export interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBigScreen: boolean;
  isUltraWide: boolean;
  isUltraUltraWide: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'bigScreen' | 'ultraWide' | 'ultraUltraWide';
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
}

export interface ResponsiveConfig {
  mobileColumns: number;
  tabletColumns: number;
  desktopColumns: number;
  bigScreenColumns: number;
  ultraWideColumns: number;
  ultraUltraWideColumns: number;
}

@Injectable({
  providedIn: 'root'
})
export class ViewportService {
  private readonly defaultBreakpoints: ViewportBreakpoints = {
    mobile: 768,        // 0 - 767px
    tablet: 1024,       // 768 - 1023px  
    desktop: 1680,      // 1024 - 1679px (most common desktop sizes)
    bigScreen: 1920,    // 1680 - 1919px (large desktop monitors)
    ultraWide: 2560,    // 1920 - 2559px (4K)
    ultraUltraWide: 2561 // 2560px+ (5K+)
  };

  private breakpoints: ViewportBreakpoints;
  private viewportStateSubject = new BehaviorSubject<ViewportState>(this.getCurrentViewportState());
  
  // Observables for viewport state
  public viewportState$: Observable<ViewportState>;
  public isMobile$: Observable<boolean>;
  public isTablet$: Observable<boolean>;
  public isDesktop$: Observable<boolean>;
  public isBigScreen$: Observable<boolean>;
  public isUltraWide$: Observable<boolean>;
  public isUltraUltraWide$: Observable<boolean>;
  public deviceType$: Observable<'mobile' | 'tablet' | 'desktop' | 'bigScreen' | 'ultraWide' | 'ultraUltraWide'>;
  public orientation$: Observable<'portrait' | 'landscape'>;
  public isTouch$: Observable<boolean>;

  constructor(@Inject(DOCUMENT) private document: Document) {
    // Safari compatibility - detect Safari and log for debugging
    const isSafari = typeof window !== 'undefined' && 
      window.navigator && 
      /Safari/.test(window.navigator.userAgent) && 
      /Apple Computer/.test(window.navigator.vendor);
    
    if (isSafari) {
      console.log('ViewportService: Safari detected, applying compatibility fixes');
      console.log('ViewportService: Document available:', !!this.document);
      console.log('ViewportService: Document.defaultView available:', !!this.document?.defaultView);
      console.log('ViewportService: Window available:', typeof window !== 'undefined');
    }
    
    // Safari compatibility - ensure breakpoints are always initialized
    try {
      this.breakpoints = { ...this.defaultBreakpoints };
    } catch (error) {
      console.warn('ViewportService: Failed to initialize breakpoints, using defaults', error);
      this.breakpoints = {
        mobile: 768,
        tablet: 1024,
        desktop: 1680,
        bigScreen: 1920,
        ultraWide: 2560,
        ultraUltraWide: 2561
      };
    }
    
    // Safari compatibility: ensure we can get initial viewport state
    try {
      const initialState = this.getCurrentViewportState();
      this.viewportStateSubject = new BehaviorSubject<ViewportState>(initialState);
    } catch (error) {
      console.warn('ViewportService: Failed to get initial viewport state, using defaults', error);
      // Fallback state for Safari or SSR
      const fallbackState: ViewportState = {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isBigScreen: false,
        isUltraWide: false,
        isUltraUltraWide: false,
        deviceType: 'desktop',
        orientation: 'landscape',
        isTouch: false
      };
      this.viewportStateSubject = new BehaviorSubject<ViewportState>(fallbackState);
    }
    
    // Create the main viewport state observable
    this.viewportState$ = this.viewportStateSubject.asObservable().pipe(
      distinctUntilChanged((prev, curr) => 
        prev.width === curr.width && 
        prev.height === curr.height && 
        prev.deviceType === curr.deviceType &&
        prev.orientation === curr.orientation
      ),
      shareReplay(1)
    );

    // Create specific observables for different properties
    this.isMobile$ = this.viewportState$.pipe(
      map(state => state.isMobile),
      distinctUntilChanged()
    );

    this.isTablet$ = this.viewportState$.pipe(
      map(state => state.isTablet),
      distinctUntilChanged()
    );

    this.isDesktop$ = this.viewportState$.pipe(
      map(state => state.isDesktop),
      distinctUntilChanged()
    );

    this.isBigScreen$ = this.viewportState$.pipe(
      map(state => state.isBigScreen),
      distinctUntilChanged()
    );

    this.isUltraWide$ = this.viewportState$.pipe(
      map(state => state.isUltraWide),
      distinctUntilChanged()
    );

    this.isUltraUltraWide$ = this.viewportState$.pipe(
      map(state => state.isUltraUltraWide),
      distinctUntilChanged()
    );

    this.deviceType$ = this.viewportState$.pipe(
      map(state => state.deviceType),
      distinctUntilChanged()
    );

    this.orientation$ = this.viewportState$.pipe(
      map(state => state.orientation),
      distinctUntilChanged()
    );

    this.isTouch$ = this.viewportState$.pipe(
      map(state => state.isTouch),
      distinctUntilChanged()
    );

    // Listen for window resize events
    this.initializeResizeListener();
  }

  /**
   * Get current viewport state
   */
  getCurrentViewportState(): ViewportState {
    const width = this.getViewportWidth();
    const height = this.getViewportHeight();
    
    return {
      width,
      height,
      isMobile: this.isMobileWidth(width),
      isTablet: this.isTabletWidth(width),
      isDesktop: this.isDesktopWidth(width),
      isBigScreen: this.isBigScreenWidth(width),
      isUltraWide: this.isUltraWideWidth(width),
      isUltraUltraWide: this.isUltraUltraWideWidth(width),
      deviceType: this.getDeviceType(width),
      orientation: this.getOrientation(width, height),
      isTouch: this.isTouchDevice()
    };
  }

  /**
   * Get current device type
   */
  getCurrentDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'bigScreen' | 'ultraWide' | 'ultraUltraWide' {
    return this.getDeviceType(this.getViewportWidth());
  }

  /**
   * Check if current viewport is mobile
   */
  isMobile(): boolean {
    return this.isMobileWidth(this.getViewportWidth());
  }

  /**
   * Check if current viewport is tablet
   */
  isTablet(): boolean {
    return this.isTabletWidth(this.getViewportWidth());
  }

  /**
   * Check if current viewport is desktop
   */
  isDesktop(): boolean {
    return this.isDesktopWidth(this.getViewportWidth());
  }

  /**
   * Check if current viewport is big screen
   */
  isBigScreen(): boolean {
    return this.isBigScreenWidth(this.getViewportWidth());
  }

  /**
   * Check if current viewport is ultra-wide
   */
  isUltraWide(): boolean {
    return this.isUltraWideWidth(this.getViewportWidth());
  }

  /**
   * Check if current viewport is ultra-ultra-wide
   */
  isUltraUltraWide(): boolean {
    return this.isUltraUltraWideWidth(this.getViewportWidth());
  }

  /**
   * Check if viewport is mobile or tablet (touch-friendly)
   */
  isMobileOrTablet(): boolean {
    const width = this.getViewportWidth();
    return this.isMobileWidth(width) || this.isTabletWidth(width);
  }

  /**
   * Check if viewport is desktop or big screen
   */
  isDesktopOrBigger(): boolean {
    const width = this.getViewportWidth();
    return this.isDesktopWidth(width) || this.isBigScreenWidth(width) || this.isUltraWideWidth(width) || this.isUltraUltraWideWidth(width);
  }

  /**
   * Get responsive columns based on device type
   */
  getResponsiveColumns(config: ResponsiveConfig): number {
    const deviceType = this.getCurrentDeviceType();
    
    switch (deviceType) {
      case 'mobile':
        return config.mobileColumns;
      case 'tablet':
        return config.tabletColumns;
      case 'desktop':
        return config.desktopColumns;
      case 'bigScreen':
        return config.bigScreenColumns;
      case 'ultraWide':
        return config.ultraWideColumns;
      case 'ultraUltraWide':
        return config.ultraUltraWideColumns;
      default:
        return config.desktopColumns;
    }
  }

  /**
   * Get responsive CSS classes
   */
  getResponsiveClasses(): string[] {
    const state = this.viewportStateSubject.value;
    const classes = [
      `viewport-${state.deviceType}`,
      `orientation-${state.orientation}`,
      state.isTouch ? 'touch-device' : 'no-touch'
    ];

    if (state.isMobile) classes.push('is-mobile');
    if (state.isTablet) classes.push('is-tablet');
    if (state.isDesktop) classes.push('is-desktop');
    if (state.isBigScreen) classes.push('is-big-screen');
    if (state.isUltraWide) classes.push('is-ultra-wide');
    if (state.isUltraUltraWide) classes.push('is-ultra-ultra-wide');
    if (this.isMobileOrTablet()) classes.push('is-mobile-or-tablet');
    if (this.isDesktopOrBigger()) classes.push('is-desktop-or-bigger');

    return classes;
  }

  /**
   * Update breakpoints
   */
  setBreakpoints(breakpoints: Partial<ViewportBreakpoints>): void {
    // Safari compatibility - ensure breakpoints are properly initialized
    if (!this.breakpoints) {
      this.breakpoints = { ...this.defaultBreakpoints };
    }
    this.breakpoints = { ...this.breakpoints, ...breakpoints };
    this.updateViewportState();
  }

  /**
   * Get current breakpoints
   */
  getBreakpoints(): ViewportBreakpoints {
    // Safari compatibility - return default breakpoints if not initialized
    return { ...(this.breakpoints || this.defaultBreakpoints) };
  }

  /**
   * Match media query
   */
  matchMedia(query: string): Observable<boolean> {
    // Safari compatibility - check for window first
    const windowObject = typeof window !== 'undefined' ? window : this.document?.defaultView;
    
    if (!windowObject || !windowObject.matchMedia) {
      return new BehaviorSubject(false).asObservable();
    }

    const mediaQuery = windowObject.matchMedia(query);
    
    return fromEvent<MediaQueryListEvent>(mediaQuery, 'change').pipe(
      startWith(mediaQuery),
      map((list: MediaQueryList | MediaQueryListEvent) => list.matches),
      distinctUntilChanged()
    );
  }

  /**
   * Create custom breakpoint observable
   */
  createBreakpointObservable(minWidth?: number, maxWidth?: number): Observable<boolean> {
    let query = '';
    
    if (minWidth && maxWidth) {
      query = `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;
    } else if (minWidth) {
      query = `(min-width: ${minWidth}px)`;
    } else if (maxWidth) {
      query = `(max-width: ${maxWidth}px)`;
    } else {
      throw new Error('Either minWidth or maxWidth must be specified');
    }

    return this.matchMedia(query);
  }

  // Private methods
  private initializeResizeListener(): void {
    // Safari compatibility - check for window first
    const windowObject = typeof window !== 'undefined' ? window : this.document?.defaultView;
    
    if (!windowObject) return;

    fromEvent(windowObject, 'resize').pipe(
      map(() => this.getCurrentViewportState()),
      distinctUntilChanged((prev, curr) => 
        prev.width === curr.width && 
        prev.height === curr.height &&
        prev.deviceType === curr.deviceType &&
        prev.orientation === curr.orientation
      )
    ).subscribe(state => {
      this.viewportStateSubject.next(state);
    });

    // Also listen for orientation change
    fromEvent(windowObject, 'orientationchange').pipe(
      map(() => this.getCurrentViewportState())
    ).subscribe(state => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(() => {
        const updatedState = this.getCurrentViewportState();
        this.viewportStateSubject.next(updatedState);
      }, 100);
    });
  }

  private updateViewportState(): void {
    this.viewportStateSubject.next(this.getCurrentViewportState());
  }

  private getViewportWidth(): number {
    // Check for window object first (Safari compatibility)
    if (typeof window !== 'undefined') {
      return window.innerWidth || document.documentElement.clientWidth || 1024;
    }
    
    // Fallback to document.defaultView if window is not available
    if (this.document?.defaultView) {
      return this.document.defaultView.innerWidth || 1024;
    }
    
    // Final fallback
    return 1024;
  }

  private getViewportHeight(): number {
    // Check for window object first (Safari compatibility)
    if (typeof window !== 'undefined') {
      return window.innerHeight || document.documentElement.clientHeight || 768;
    }
    
    // Fallback to document.defaultView if window is not available
    if (this.document?.defaultView) {
      return this.document.defaultView.innerHeight || 768;
    }
    
    // Final fallback
    return 768;
  }

  private isMobileWidth(width: number): boolean {
    const breakpoints = this.breakpoints || this.defaultBreakpoints;
    return width < breakpoints.mobile;
  }

  private isTabletWidth(width: number): boolean {
    const breakpoints = this.breakpoints || this.defaultBreakpoints;
    return width >= breakpoints.mobile && width < breakpoints.tablet;
  }

  private isDesktopWidth(width: number): boolean {
    const breakpoints = this.breakpoints || this.defaultBreakpoints;
    return width >= breakpoints.tablet && width < breakpoints.desktop;
  }

  private isBigScreenWidth(width: number): boolean {
    const breakpoints = this.breakpoints || this.defaultBreakpoints;
    return width >= breakpoints.desktop && width < breakpoints.bigScreen;
  }

  private isUltraWideWidth(width: number): boolean {
    const breakpoints = this.breakpoints || this.defaultBreakpoints;
    return width >= breakpoints.bigScreen && width < breakpoints.ultraWide;
  }

  private isUltraUltraWideWidth(width: number): boolean {
    const breakpoints = this.breakpoints || this.defaultBreakpoints;
    return width >= breakpoints.ultraWide;
  }

  private getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' | 'bigScreen' | 'ultraWide' | 'ultraUltraWide' {
    if (this.isMobileWidth(width)) return 'mobile';
    if (this.isTabletWidth(width)) return 'tablet';
    if (this.isDesktopWidth(width)) return 'desktop';
    if (this.isBigScreenWidth(width)) return 'bigScreen';
    if (this.isUltraWideWidth(width)) return 'ultraWide';
    return 'ultraUltraWide';
  }

  private getOrientation(width: number, height: number): 'portrait' | 'landscape' {
    return width > height ? 'landscape' : 'portrait';
  }

  private isTouchDevice(): boolean {
    // Check for touch support using multiple methods
    // Safari compatibility - check for window first
    const windowObject = typeof window !== 'undefined' ? window : this.document?.defaultView;
    const hasOntouchstart = windowObject ? 'ontouchstart' in windowObject : false;
    
    const hasMaxTouchPoints = typeof navigator !== 'undefined' && 
      navigator.maxTouchPoints > 0;
    
    const hasTouchPoints = typeof navigator !== 'undefined' && 
      'msMaxTouchPoints' in navigator && 
      (navigator as any).msMaxTouchPoints > 0;
    
    return hasOntouchstart || hasMaxTouchPoints || hasTouchPoints;
  }
}
