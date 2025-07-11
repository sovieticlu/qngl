import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { ViewportService, ViewportState, ResponsiveConfig } from '../services/viewport.service';

@Component({
  selector: 'app-responsive-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="responsive-demo" [class]="'device-' + (viewportState$ | async)?.deviceType">
      <h2>Responsive Viewport Demo</h2>
      
      <!-- Viewport Information -->
      <div class="viewport-info" *ngIf="viewportState$ | async as viewport">
        <h3>Current Viewport State</h3>
        <div class="info-grid">
          <div class="info-item">
            <strong>Device Type:</strong> {{ viewport.deviceType }}
          </div>
          <div class="info-item">
            <strong>Width:</strong> {{ viewport.width }}px
          </div>
          <div class="info-item">
            <strong>Height:</strong> {{ viewport.height }}px
          </div>
          <div class="info-item">
            <strong>Orientation:</strong> {{ viewport.orientation }}
          </div>
          <div class="info-item">
            <strong>Is Touch:</strong> {{ viewport.isTouch ? 'Yes' : 'No' }}
          </div>
        </div>
        
        <!-- Device Type Indicators -->
        <div class="device-indicators">
          <div class="indicator" [class.active]="viewport.isMobile">
            📱 Mobile
          </div>
          <div class="indicator" [class.active]="viewport.isTablet">
            📐 Tablet
          </div>
          <div class="indicator" [class.active]="viewport.isDesktop">
            🖥️ Desktop
          </div>
          <div class="indicator" [class.active]="viewport.isBigScreen">
            🖥️ Big Screen
          </div>
          <div class="indicator" [class.active]="viewport.isUltraWide">
            🖥️ Ultra-Wide (4K)
          </div>
          <div class="indicator" [class.active]="viewport.isUltraUltraWide">
            🖥️ Ultra-Ultra-Wide (5K+)
          </div>
        </div>
      </div>
      
      <!-- Responsive Grid Demo -->
      <div class="responsive-grid-demo">
        <h3>Responsive Grid Example</h3>
        <div class="responsive-grid" [class]="'cols-' + currentColumns">
          <div class="grid-item" *ngFor="let item of demoItems; let i = index">
            <div class="item-content">
              <h4>Item {{ i + 1 }}</h4>
              <p>This item adapts based on screen size</p>
              <div class="item-meta">
                Columns: {{ currentColumns }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Conditional Content Demo -->
      <div class="conditional-content">
        <h3>Conditional Content</h3>
        
        <!-- Mobile-only content -->
        <div *ngIf="isMobile$ | async" class="mobile-only">
          <h4>📱 Mobile-Only Content</h4>
          <p>This content only appears on mobile devices.</p>
          <button class="touch-friendly-btn">Touch-Friendly Button</button>
        </div>
        
        <!-- Tablet and up content -->
        <div *ngIf="(isTablet$ | async) || (isDesktop$ | async) || (isBigScreen$ | async) || (isUltraWide$ | async) || (isUltraUltraWide$ | async)" class="tablet-up">
          <h4>📐 Tablet & Desktop Content</h4>
          <p>This content appears on tablet and larger screens.</p>
          <div class="action-buttons">
            <button>Action 1</button>
            <button>Action 2</button>
            <button>Action 3</button>
          </div>
        </div>
        
        <!-- Desktop-only content -->
        <div *ngIf="(isDesktop$ | async) || (isBigScreen$ | async) || (isUltraWide$ | async) || (isUltraUltraWide$ | async)" class="desktop-only">
          <h4>🖥️ Desktop-Only Features</h4>
          <p>Advanced features available on desktop.</p>
          <div class="advanced-controls">
            <div class="control-group">
              <label>Advanced Setting 1</label>
              <input type="range" min="0" max="100" value="50">
            </div>
            <div class="control-group">
              <label>Advanced Setting 2</label>
              <select>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Big screen and up exclusive -->
        <div *ngIf="(isBigScreen$ | async) || (isUltraWide$ | async) || (isUltraUltraWide$ | async)" class="big-screen-only">
          <h4>🖥️ Big Screen+ Exclusive</h4>
          <p>Ultra-wide layout and additional features for large displays.</p>
          <div class="wide-layout">
            <div class="column">Column 1</div>
            <div class="column">Column 2</div>
            <div class="column">Column 3</div>
            <div class="column">Column 4</div>
          </div>
        </div>

        <!-- Ultra-wide exclusive content -->
        <div *ngIf="(isUltraWide$ | async) || (isUltraUltraWide$ | async)" class="ultra-wide-only">
          <h4>🖥️ Ultra-Wide (4K+) Exclusive</h4>
          <p>Maximum width utilization for ultra-wide displays (1920px+).</p>
          <div class="ultra-wide-layout">
            <div class="column">Col 1</div>
            <div class="column">Col 2</div>
            <div class="column">Col 3</div>
            <div class="column">Col 4</div>
            <div class="column">Col 5</div>
          </div>
        </div>

        <!-- Ultra-ultra-wide exclusive content -->
        <div *ngIf="isUltraUltraWide$ | async" class="ultra-ultra-wide-only">
          <h4>🖥️ 5K+ Ultra-Ultra-Wide Exclusive</h4>
          <p>Maximum screen real estate utilization for 5K+ displays (2560px+).</p>
          <div class="ultra-ultra-wide-layout">
            <div class="column">Col 1</div>
            <div class="column">Col 2</div>
            <div class="column">Col 3</div>
            <div class="column">Col 4</div>
            <div class="column">Col 5</div>
            <div class="column">Col 6</div>
          </div>
        </div>
      </div>
      
      <!-- Orientation-based content -->
      <div class="orientation-demo" *ngIf="viewportState$ | async as viewport">
        <h3>Orientation-Based Layout</h3>
        <div class="orientation-content" [class]="'orientation-' + viewport.orientation">
          <div class="orientation-info">
            Currently in {{ viewport.orientation }} mode
          </div>
          <div class="orientation-specific">
            <ng-container *ngIf="viewport.orientation === 'portrait'">
              <p>📱 Portrait mode: Vertical layout optimized</p>
              <div class="vertical-stack">
                <div class="stack-item">Item 1</div>
                <div class="stack-item">Item 2</div>
                <div class="stack-item">Item 3</div>
              </div>
            </ng-container>
            <ng-container *ngIf="viewport.orientation === 'landscape'">
              <p>📐 Landscape mode: Horizontal layout optimized</p>
              <div class="horizontal-stack">
                <div class="stack-item">Item 1</div>
                <div class="stack-item">Item 2</div>
                <div class="stack-item">Item 3</div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./responsive-demo.component.scss']
})
export class ResponsiveDemoComponent implements OnInit, OnDestroy {
  viewportState$: Observable<ViewportState>;
  isMobile$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isDesktop$: Observable<boolean>;
  isBigScreen$: Observable<boolean>;
  isUltraWide$: Observable<boolean>;
  isUltraUltraWide$: Observable<boolean>;
  
  private subscriptions = new Subscription();
  
  // Demo data
  demoItems = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }));
  currentColumns = 1;

  // Responsive grid configuration
  private responsiveConfig: ResponsiveConfig = {
    mobileColumns: 1,
    tabletColumns: 2,
    desktopColumns: 3,
    bigScreenColumns: 4,
    ultraWideColumns: 5,
    ultraUltraWideColumns: 6
  };

  constructor(private viewportService: ViewportService) {
    this.viewportState$ = this.viewportService.viewportState$;
    this.isMobile$ = this.viewportService.isMobile$;
    this.isTablet$ = this.viewportService.isTablet$;
    this.isDesktop$ = this.viewportService.isDesktop$;
    this.isBigScreen$ = this.viewportService.isBigScreen$;
    this.isUltraWide$ = this.viewportService.isUltraWide$;
    this.isUltraUltraWide$ = this.viewportService.isUltraUltraWide$;
  }

  ngOnInit(): void {
    // Subscribe to viewport changes to update grid columns
    this.subscriptions.add(
      this.viewportState$.subscribe(state => {
        this.updateGridColumns(state);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateGridColumns(state: ViewportState): void {
    if (state.isMobile) {
      this.currentColumns = this.responsiveConfig.mobileColumns;
    } else if (state.isTablet) {
      this.currentColumns = this.responsiveConfig.tabletColumns;
    } else if (state.isDesktop) {
      this.currentColumns = this.responsiveConfig.desktopColumns;
    } else if (state.isBigScreen) {
      this.currentColumns = this.responsiveConfig.bigScreenColumns;
    } else if (state.isUltraWide) {
      this.currentColumns = this.responsiveConfig.ultraWideColumns;
    } else if (state.isUltraUltraWide) {
      this.currentColumns = this.responsiveConfig.ultraUltraWideColumns;
    }
  }
}
