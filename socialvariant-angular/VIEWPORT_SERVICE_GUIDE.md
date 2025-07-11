# ViewportService Usage Guide

The `ViewportService` provides reactive responsive state management for Angular applications using RxJS Observables. It automatically detects device types, screen sizes, orientation, and touch capabilities.

## Features

- 🔍 **Device Detection**: Mobile, Tablet, Desktop, Big Screen
- 📐 **Orientation Detection**: Portrait/Landscape
- 👆 **Touch Detection**: Touch vs Non-touch devices
- 📱 **Responsive Breakpoints**: Customizable breakpoints
- 🔄 **Real-time Updates**: Reactive observables for viewport changes
- 💪 **TypeScript Support**: Full type safety and IntelliSense

## Quick Start

### 1. Inject the Service

```typescript
import { Component } from "@angular/core";
import { ViewportService, ViewportState } from "./services/viewport.service";

@Component({
  selector: "app-my-component",
  template: `
    <div [class]="'device-' + (viewportState$ | async)?.deviceType">
      <h1>Responsive Content</h1>
      <!-- Content adapts based on device type -->
    </div>
  `,
})
export class MyComponent {
  viewportState$ = this.viewportService.viewportState$;
  isMobile$ = this.viewportService.isMobile$;

  constructor(private viewportService: ViewportService) {}
}
```

### 2. Conditional Content Based on Device Type

```typescript
// In your component template
<div *ngIf="isMobile$ | async" class="mobile-content">
  <p>Mobile-specific content</p>
</div>

<div *ngIf="(isDesktop$ | async) || (isBigScreen$ | async)" class="desktop-content">
  <p>Desktop and big screen content</p>
</div>
```

### 3. Responsive Grid Layouts

```typescript
export class ResponsiveGridComponent implements OnInit {
  currentColumns = 1;

  constructor(private viewportService: ViewportService) {}

  ngOnInit() {
    this.viewportService.viewportState$.subscribe((state) => {
      if (state.isMobile) {
        this.currentColumns = 1;
      } else if (state.isTablet) {
        this.currentColumns = 2;
      } else if (state.isDesktop) {
        this.currentColumns = 3;
      } else if (state.isBigScreen) {
        this.currentColumns = 4;
      }
    });
  }
}
```

## Available Observables

| Observable       | Type                        | Description                    |
| ---------------- | --------------------------- | ------------------------------ |
| `viewportState$` | `Observable<ViewportState>` | Complete viewport state        |
| `isMobile$`      | `Observable<boolean>`       | True when screen ≤ 767px       |
| `isTablet$`      | `Observable<boolean>`       | True when screen 768-1023px    |
| `isDesktop$`     | `Observable<boolean>`       | True when screen 1024-1439px   |
| `isBigScreen$`   | `Observable<boolean>`       | True when screen ≥ 1440px      |
| `deviceType$`    | `Observable<string>`        | Current device type string     |
| `orientation$`   | `Observable<string>`        | 'portrait' or 'landscape'      |
| `isTouch$`       | `Observable<boolean>`       | True for touch-capable devices |

## ViewportState Interface

```typescript
interface ViewportState {
  width: number; // Current viewport width
  height: number; // Current viewport height
  isMobile: boolean; // Mobile device flag
  isTablet: boolean; // Tablet device flag
  isDesktop: boolean; // Desktop device flag
  isBigScreen: boolean; // Big screen device flag
  deviceType: "mobile" | "tablet" | "desktop" | "bigScreen";
  orientation: "portrait" | "landscape";
  isTouch: boolean; // Touch capability flag
}
```

## Custom Breakpoints

```typescript
// Configure custom breakpoints
const customBreakpoints = {
  mobile: 480, // 0-479px
  tablet: 768, // 480-767px
  desktop: 1200, // 768-1199px
  bigScreen: 1201, // 1200px+
};

this.viewportService.setBreakpoints(customBreakpoints);
```

## CSS Integration

Use device classes in your SCSS/CSS:

```scss
.my-component {
  &.device-mobile {
    padding: 1rem;
    font-size: 0.875rem;
  }

  &.device-tablet {
    padding: 1.5rem;
    font-size: 1rem;
  }

  &.device-desktop {
    padding: 2rem;
    font-size: 1.125rem;
  }

  &.device-bigScreen {
    padding: 3rem;
    font-size: 1.25rem;
    max-width: 1400px;
  }

  // Touch-specific styles
  &.touch {
    button {
      min-height: 44px; // Touch-friendly targets
    }
  }

  &.no-touch {
    button:hover {
      transform: translateY(-1px); // Hover effects for non-touch
    }
  }
}
```

## Advanced Usage

### Layout Component Integration

```typescript
@Component({
  template: `
    <div class="layout" [class]="layoutClasses$ | async">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed && !isMobile">
        <!-- Sidebar content -->
      </aside>
      <main class="content" [class.sidebar-collapsed]="sidebarCollapsed && !isMobile">
        <!-- Main content -->
      </main>
    </div>
  `,
})
export class LayoutComponent {
  layoutClasses$ = this.viewportService.viewportState$.pipe(map((state) => [`device-${state.deviceType}`, `orientation-${state.orientation}`, state.isTouch ? "touch" : "no-touch"].join(" ")));

  isMobile$ = this.viewportService.isMobile$;
  sidebarCollapsed = false;

  constructor(private viewportService: ViewportService) {}
}
```

### Component Auto-adaptation

```typescript
@Component({
  template: `
    <div class="responsive-grid" [style.grid-template-columns]="gridColumns$ | async">
      <div *ngFor="let item of items" class="grid-item">
        {{ item.title }}
      </div>
    </div>
  `,
})
export class ResponsiveGridComponent {
  gridColumns$ = this.viewportService.viewportState$.pipe(
    map((state) => {
      if (state.isMobile) return "repeat(1, 1fr)";
      if (state.isTablet) return "repeat(2, 1fr)";
      if (state.isDesktop) return "repeat(3, 1fr)";
      return "repeat(4, 1fr)"; // Big screen
    })
  );

  constructor(private viewportService: ViewportService) {}
}
```

## Best Practices

1. **Use Observables**: Always use the reactive observables instead of direct property access
2. **Unsubscribe**: Use `takeUntil` or `async` pipe to prevent memory leaks
3. **Performance**: Use `distinctUntilChanged()` to avoid unnecessary updates
4. **Touch Targets**: Ensure minimum 44px touch targets on touch devices
5. **Progressive Enhancement**: Start with mobile-first design and enhance for larger screens

## Example Implementation

See the `ResponsiveDemoComponent` in the application for a complete working example demonstrating:

- Device-specific content rendering
- Responsive grid layouts
- Orientation-based layouts
- Touch vs non-touch optimizations
- Real-time viewport information display

Visit `/responsive` in the application to see the ViewportService in action!
