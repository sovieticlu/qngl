import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DocumentHeadService } from '../services/document-head.service';
import { NotificationService } from '../services/notification.service';
import { AppStateService } from '../services/app-state.service';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ThemeState } from '../store/app.state';

@Component({
  selector: 'app-page-example',
  imports: [AsyncPipe],
  template: `
    <div class="container">
      <h1>Dynamic Meta Tags Example</h1>
      <p>This page demonstrates dynamic meta tag updates.</p>
      
      <div class="meta-controls">
        <h3>Update Meta Tags:</h3>
        <button (click)="updateBlogPost()" class="btn">Blog Post Meta</button>
        <button (click)="updateProduct()" class="btn">Product Meta</button>
        <button (click)="updateEvent()" class="btn">Event Meta</button>
        <button (click)="updateDefault()" class="btn">Default Meta</button>
      </div>
      
      <div class="current-meta">
        <h3>Current Meta Information:</h3>
        <p><strong>Title:</strong> {{ currentTitle }}</p>
        <p><strong>Description:</strong> {{ currentDescription }}</p>
        <p><strong>Type:</strong> {{ currentType }}</p>
        <p><strong>JSON-LD:</strong> {{ hasJsonLd ? 'Yes' : 'No' }}</p>
        <p><strong>Canonical URL:</strong> {{ hasCanonical ? 'Set' : 'Not set' }}</p>
      </div>

      <div class="theme-info">
        <h3>Current Theme Information:</h3>
        <p><strong>Theme Name:</strong> {{ currentTheme$ | async }}</p>
        <p><strong>Mode:</strong> {{ (isDarkMode$ | async) ? 'Dark' : 'Light' }}</p>
        <p><strong>Primary Color:</strong> 
          <span [style.background-color]="primaryColor$ | async" 
                [style.color]="'white'" 
                [style.padding]="'2px 8px'" 
                [style.border-radius]="'4px'">
            {{ primaryColor$ | async }}
          </span>
        </p>
        <p><strong>Accent Color:</strong> 
          <span [style.background-color]="accentColor$ | async" 
                [style.color]="'white'" 
                [style.padding]="'2px 8px'" 
                [style.border-radius]="'4px'">
            {{ accentColor$ | async }}
          </span>
        </p>
        <button (click)="toggleTheme()" class="btn">Toggle Theme</button>
      </div>
      
      <div class="seo-info">
        <h3>SEO Features Demonstrated:</h3>
        <ul>
          <li>✅ Dynamic page titles</li>
          <li>✅ Meta descriptions for search engines</li>
          <li>✅ Open Graph tags for social media</li>
          <li>✅ Twitter Card optimization</li>
          <li>✅ JSON-LD structured data</li>
          <li>✅ Canonical URLs</li>
          <li>✅ Custom meta tags</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    // Component-specific CSS variables
    :host {
      --primary-color: #007bff;
      --primary-hover: #0056b3;
      --success-color: #28a745;
      --warning-color: #ffc107;
      --info-color: #17a2b8;
      --text-primary: #212529;
      --text-secondary: #6c757d;
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --border-color: #dee2e6;
      --border-radius: 0.375rem;
      --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      
      display: block;
      padding: 2rem 0;
    }
    
    // Container specific to this component
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 1rem;
      
      @media (min-width: 576px) {
        padding: 0 1.5rem;
      }
    }
    
    // Main heading
    h1 {
      font-size: 2.5rem;
      color: var(--text-primary);
      margin: 0 0 1rem 0;
      font-weight: 600;
      
      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }
    
    // Introduction paragraph
    p {
      font-size: 1.125rem;
      color: var(--text-secondary);
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }
    
    // Meta controls section
    .meta-controls {
      margin: 2rem 0;
      
      h3 {
        font-size: 1.5rem;
        margin: 0 0 1rem 0;
        color: var(--text-primary);
        font-weight: 600;
      }
    }
    
    // Button styles specific to this component
    .btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      margin: 0.5rem 0.5rem 0.5rem 0;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.875rem;
      font-weight: 500;
      display: inline-block;
      
      &:hover {
        background: var(--primary-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }
      
      &:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      
      &:active {
        transform: translateY(0);
      }
      
      @media (max-width: 768px) {
        display: block;
        width: 100%;
        margin: 0.5rem 0;
      }
    }
    
    // Current meta information display
    .current-meta {
      background: var(--bg-secondary);
      padding: 1.5rem;
      border-radius: var(--border-radius);
      margin-top: 2rem;
      border: 1px solid var(--border-color);
      
      h3 {
        font-size: 1.25rem;
        margin: 0 0 1rem 0;
        color: var(--text-primary);
        font-weight: 600;
      }
      
      p {
        margin: 0.5rem 0;
        font-size: 0.875rem;
        line-height: 1.5;
        
        strong {
          color: var(--text-primary);
          font-weight: 600;
        }
      }
      
      p:last-child {
        margin-bottom: 0;
      }
    }
    
    // SEO information section
    .seo-info {
      margin-top: 2rem;
      padding: 1.5rem;
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      
      h3 {
        color: var(--success-color);
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          padding: 0.5rem 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
          
          &::before {
            content: '';
            margin-right: 0.5rem;
          }
        }
      }
    }
    
    // Responsive adjustments
    @media (max-width: 768px) {
      :host {
        padding: 1rem 0;
      }
      
      .meta-controls {
        margin: 1.5rem 0;
      }
      
      .current-meta {
        padding: 1rem;
        margin-top: 1.5rem;
      }
    }
  `]
})
export class PageExampleComponent implements OnInit, OnDestroy {
  currentTitle = '';
  currentDescription = '';
  currentType = '';
  hasJsonLd = false;
  hasCanonical = false;

  // Theme observables
  themeState$!: Observable<ThemeState>;
  currentTheme$!: Observable<string>;
  isDarkMode$!: Observable<boolean>;
  primaryColor$!: Observable<string>;
  accentColor$!: Observable<string>;

  // Demo primary colors to cycle through
  private demoColors = ['#007bff', '#28a745', '#dc3545', '#6f42c1', '#fd7e14', '#20c997'];
  private currentColorIndex = 0;

  constructor(
    private documentHeadService: DocumentHeadService,
    private notificationService: NotificationService,
    private appStateService: AppStateService,
    private themeService: ThemeService
  ) {
    // Initialize theme observables
    this.themeState$ = this.themeService.themeState$;
    this.currentTheme$ = this.themeState$.pipe(map(state => state.currentTheme));
    this.isDarkMode$ = this.themeService.isDarkMode$;
    // For demo purposes, create observables for colors
    this.primaryColor$ = this.themeState$.pipe(map(state => state.themes.find(t => t.id === state.currentTheme)?.colors.primary || '#007bff'));
    this.accentColor$ = this.themeState$.pipe(map(state => state.themes.find(t => t.id === state.currentTheme)?.colors.accent || '#6f42c1'));
  }

  ngOnInit(): void {
    // Update navigation state
    this.appStateService.setCurrentRoute('/demo', 'Meta Tags Demo');
    
    // Set default meta tags for demo page
    this.updateDefault();
  }

  ngOnDestroy(): void {
    // Component cleanup if needed
  }

  updateBlogPost(): void {
    this.appStateService.setLoading(true);
    
    // Simulate async operation
    setTimeout(() => {
      const metaData = {
        title: 'How to Implement Dynamic Meta Tags in Angular',
        description: 'Learn how to implement dynamic meta tags in Angular applications for better SEO and social media sharing.',
        keywords: 'angular, meta tags, SEO, social media, blog',
        ogType: 'article',
        ogUrl: window.location.href,
        ogImage: '/assets/blog-post-image.jpg',
        author: 'Tech Blogger',
        canonical: window.location.href,
        jsonLd: [{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': 'How to Implement Dynamic Meta Tags in Angular',
          'description': 'Learn how to implement dynamic meta tags in Angular applications for better SEO and social media sharing.',
          'author': {
            '@type': 'Person',
            'name': 'Tech Blogger'
          },
          'datePublished': '2025-06-27',
          'dateModified': '2025-06-27',
          'publisher': {
            '@type': 'Organization',
            'name': 'SocialVariant',
            'logo': {
              '@type': 'ImageObject',
              'url': '/assets/logo.png'
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': window.location.href
          },
          'image': '/assets/blog-post-image.jpg'
        }]
      };

      this.documentHeadService.updateHead(metaData);
      this.updateCurrentMeta(metaData);
      this.appStateService.setLoading(false);
      this.notificationService.success('Blog post meta tags updated successfully!');
    }, 1000);
  }

  updateProduct(): void {
    this.appStateService.setLoading(true);
    
    setTimeout(() => {
      const metaData = {
        title: 'Amazing Product - SocialVariant Store',
        description: 'Discover our amazing product with incredible features and unbeatable price. Limited time offer!',
        keywords: 'product, store, shopping, amazing, offer',
        ogType: 'product',
        ogUrl: window.location.href,
        ogImage: '/assets/product-image.jpg',
        author: 'SocialVariant Store',
        canonical: window.location.href,
        customTags: [
          { property: 'product:price:amount', content: '99.99' },
          { property: 'product:price:currency', content: 'USD' },
          { property: 'product:availability', content: 'in stock' }
        ],
        jsonLd: [{
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': 'Amazing Product',
          'description': 'Discover our amazing product with incredible features and unbeatable price. Limited time offer!',
          'image': '/assets/product-image.jpg',
          'brand': {
            '@type': 'Brand',
            'name': 'SocialVariant'
          },
          'offers': {
            '@type': 'Offer',
            'price': '99.99',
            'priceCurrency': 'USD',
            'availability': 'https://schema.org/InStock',
            'url': window.location.href
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.5',
            'reviewCount': '127'
          }
        }]
      };

      this.documentHeadService.updateHead(metaData);
      this.updateCurrentMeta(metaData);
      this.appStateService.setLoading(false);
      this.notificationService.success('Product meta tags updated successfully!');
    }, 800);
  }

  updateEvent(): void {
    const metaData = {
      title: 'Angular Conference 2025 - Advanced Techniques Workshop',
      description: 'Join us for an intensive Angular workshop covering advanced techniques, meta tag optimization, and SEO best practices.',
      keywords: 'angular, conference, workshop, 2025, advanced, SEO',
      ogType: 'event',
      ogUrl: window.location.href,
      ogImage: '/assets/event-image.jpg',
      author: 'SocialVariant Events',
      canonical: window.location.href,
      jsonLd: [{
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': 'Angular Conference 2025 - Advanced Techniques Workshop',
        'description': 'Join us for an intensive Angular workshop covering advanced techniques, meta tag optimization, and SEO best practices.',
        'startDate': '2025-09-15T09:00:00-07:00',
        'endDate': '2025-09-15T17:00:00-07:00',
        'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
        'eventStatus': 'https://schema.org/EventScheduled',
        'location': {
          '@type': 'Place',
          'name': 'SocialVariant Conference Center',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': '123 Tech Street',
            'addressLocality': 'San Francisco',
            'addressRegion': 'CA',
            'postalCode': '94105',
            'addressCountry': 'US'
          }
        },
        'organizer': {
          '@type': 'Organization',
          'name': 'SocialVariant',
          'url': 'https://socialvariant.com'
        }
      }]
    };

    this.documentHeadService.updateHead(metaData);
    this.updateCurrentMeta(metaData);
  }

  updateDefault(): void {
    const metaData = {
      title: 'SocialVariant Angular - Dynamic Meta Tags Demo',
      description: 'A demonstration of dynamic meta tag implementation in Angular applications.',
      keywords: 'angular, demo, meta tags, dynamic',
      ogType: 'website',
      ogUrl: window.location.href,
      ogImage: '/assets/default-image.jpg',
      author: 'SocialVariant Team'
    };

    this.documentHeadService.updateHead(metaData);
    this.updateCurrentMeta(metaData);
  }

  private updateCurrentMeta(metaData: any): void {
    this.currentTitle = metaData.title;
    this.currentDescription = metaData.description;
    this.currentType = metaData.ogType;
    this.hasJsonLd = metaData.jsonLd && metaData.jsonLd.length > 0;
    this.hasCanonical = !!metaData.canonical;
  }

  /**
   * Toggle the application theme
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
