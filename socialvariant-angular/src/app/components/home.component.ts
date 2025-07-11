import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentHeadService } from '../services/document-head.service';
import { AppStateService } from '../services/app-state.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="container">
      <div class="hero-section">
        <h1 class="hero-title">Welcome to SocialVariant</h1>
        <p class="hero-subtitle">
          A modern Angular application demonstrating dynamic meta tags implementation
        </p>
        <div class="hero-actions">
          <a routerLink="/demo" class="btn btn-primary">
            Try Meta Tags Demo
          </a>
          <a href="https://github.com/yourusername/socialvariant-angular" 
             target="_blank" 
             rel="noopener" 
             class="btn btn-outline">
            View on GitHub
          </a>
        </div>
      </div>
      
      <div class="features-section">
        <h2>Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Dynamic Meta Tags</h3>
            <p>Automatically update meta tags for better SEO and social media sharing</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>Modern Angular</h3>
            <p>Built with Angular 20+ using the latest features and best practices</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Responsive Design</h3>
            <p>Optimized for all devices with a clean, modern interface</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>High Performance</h3>
            <p>Fast loading times and optimized bundle size</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    // Component-specific CSS variables
    :host {
      --primary-color: #007bff;
      --primary-hover: #0056b3;
      --text-primary: #212529;
      --text-secondary: #6c757d;
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --border-color: #dee2e6;
      --border-radius: 0.375rem;
      --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      --shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      
      display: block;
      padding: 2rem 0;
    }
    
    // Container specific to this component
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      
      @media (min-width: 576px) {
        padding: 0 1.5rem;
      }
    }
    
    // Hero section styles
    .hero-section {
      text-align: center;
      padding: 4rem 0;
      max-width: 800px;
      margin: 0 auto;
      
      @media (max-width: 768px) {
        padding: 2rem 0;
      }
    }
    
    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1rem 0;
      line-height: 1.2;
      
      @media (max-width: 768px) {
        font-size: 2rem;
      }
      
      @media (max-width: 480px) {
        font-size: 1.75rem;
      }
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-secondary);
      margin: 0 0 2rem 0;
      line-height: 1.6;
      
      @media (max-width: 768px) {
        font-size: 1.125rem;
      }
    }
    
    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    // Button styles specific to this component
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: var(--border-radius);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 140px;
      cursor: pointer;
      
      &:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
    }
    
    .btn-primary {
      background: var(--primary-color);
      color: white;
      
      &:hover {
        background: var(--primary-hover);
        transform: translateY(-2px);
        box-shadow: var(--shadow);
        text-decoration: none;
      }
    }
    
    .btn-outline {
      background: transparent;
      color: var(--primary-color);
      border-color: var(--primary-color);
      
      &:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
        box-shadow: var(--shadow);
        text-decoration: none;
      }
    }
    
    // Features section styles
    .features-section {
      padding: 4rem 0;
      
      @media (max-width: 768px) {
        padding: 2rem 0;
      }
      
      h2 {
        text-align: center;
        font-size: 2.5rem;
        margin: 0 0 3rem 0;
        color: var(--text-primary);
        font-weight: 600;
        
        @media (max-width: 768px) {
          font-size: 2rem;
          margin-bottom: 2rem;
        }
      }
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }
    
    .feature-card {
      background: var(--bg-primary);
      padding: 2rem;
      border-radius: var(--border-radius);
      text-align: center;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      border: 1px solid var(--border-color);
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow);
      }
      
      @media (max-width: 768px) {
        padding: 1.5rem;
      }
    }
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }
    
    .feature-card h3 {
      font-size: 1.25rem;
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-weight: 600;
    }
    
    .feature-card p {
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.6;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    private documentHeadService: DocumentHeadService,
    private appStateService: AppStateService
  ) {}

  ngOnInit(): void {
    // Update navigation state
    this.appStateService.setCurrentRoute('/', 'Home');
    
    // Set home page meta tags
    this.setHomePageMeta();
  }

  ngOnDestroy(): void {
    // Component cleanup if needed
  }

  private setHomePageMeta(): void {
    // Set home page meta tags with absolute URLs
    const absoluteImageUrl = this.documentHeadService.getAbsoluteUrl('/assets/home-og-image.jpg');
    
    this.documentHeadService.updateHead({
      title: 'SocialVariant - Angular Meta Tags Demo',
      description: 'A modern Angular application demonstrating dynamic meta tags implementation for better SEO and social media sharing.',
      keywords: 'angular, meta tags, SEO, social media, typescript, web development',
      ogType: 'website',
      ogUrl: window.location.href,
      ogImage: absoluteImageUrl,
      author: 'SocialVariant Team',
      canonical: window.location.href,
      jsonLd: [{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': 'SocialVariant - Angular Meta Tags Demo',
        'description': 'A modern Angular application demonstrating dynamic meta tags implementation for better SEO and social media sharing.',
        'url': window.location.href,
        'mainEntity': {
          '@type': 'SoftwareApplication',
          'name': 'SocialVariant Angular',
          'applicationCategory': 'WebApplication',
          'operatingSystem': 'Any',
          'description': 'A modern Angular application demonstrating dynamic meta tags implementation',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          }
        }
      }]
    });
  }
}
