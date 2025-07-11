import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface DocumentHeadConfig {
  // Basic page information
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  canonical?: string;
  
  // Open Graph meta tags
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogSiteName?: string;
  ogLocale?: string;
  
  // Twitter Card meta tags
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  // Additional meta tags
  themeColor?: string;
  msapplicationTileColor?: string;
  msapplicationTileImage?: string;
  
  // Structured data
  jsonLd?: object[];
  
  // Custom meta tags
  customTags?: { name?: string; property?: string; content: string; httpEquiv?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class DocumentHeadService {
  private readonly defaultConfig: Partial<DocumentHeadConfig> = {
    ogSiteName: 'SocialVariant',
    ogLocale: 'en_US',
    twitterCard: 'summary_large_image',
    twitterSite: '@socialvariant',
    robots: 'index,follow',
    author: 'SocialVariant Team',
    themeColor: '#007bff'
  };

  constructor(
    private titleService: Title,
    private metaService: Meta
  ) {}

  /**
   * Updates the document head with the provided configuration
   */
  updateHead(config: DocumentHeadConfig): void {
    const mergedConfig = { ...this.defaultConfig, ...config };
    
    // Update title
    if (mergedConfig.title) {
      this.titleService.setTitle(mergedConfig.title);
    }

    // Basic meta tags
    this.updateBasicMetaTags(mergedConfig);
    
    // Open Graph meta tags
    this.updateOpenGraphTags(mergedConfig);
    
    // Twitter Card meta tags
    this.updateTwitterTags(mergedConfig);
    
    // Additional meta tags
    this.updateAdditionalTags(mergedConfig);
    
    // Custom meta tags
    this.updateCustomTags(mergedConfig);
    
    // Structured data
    this.updateStructuredData(mergedConfig);
    
    // Canonical URL
    this.updateCanonicalUrl(mergedConfig);
  }

  /**
   * Updates basic meta tags
   */
  private updateBasicMetaTags(config: DocumentHeadConfig): void {
    const basicTags = [
      { name: 'description', content: config.description },
      { name: 'keywords', content: config.keywords },
      { name: 'author', content: config.author },
      { name: 'robots', content: config.robots },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ];

    basicTags.forEach(tag => {
      if (tag.content && tag.name) {
        this.updateOrAddTag('name', tag.name, tag.content);
      }
    });
  }

  /**
   * Updates Open Graph meta tags
   */
  private updateOpenGraphTags(config: DocumentHeadConfig): void {
    const ogTags = [
      { property: 'og:title', content: config.ogTitle || config.title },
      { property: 'og:description', content: config.ogDescription || config.description },
      { property: 'og:image', content: config.ogImage },
      { property: 'og:url', content: config.ogUrl || window.location.href },
      { property: 'og:type', content: config.ogType || 'website' },
      { property: 'og:site_name', content: config.ogSiteName },
      { property: 'og:locale', content: config.ogLocale }
    ];

    ogTags.forEach(tag => {
      if (tag.content) {
        this.updateOrAddTag('property', tag.property, tag.content);
      }
    });
  }

  /**
   * Updates Twitter Card meta tags
   */
  private updateTwitterTags(config: DocumentHeadConfig): void {
    const twitterTags = [
      { name: 'twitter:card', content: config.twitterCard },
      { name: 'twitter:site', content: config.twitterSite },
      { name: 'twitter:creator', content: config.twitterCreator },
      { name: 'twitter:title', content: config.twitterTitle || config.title },
      { name: 'twitter:description', content: config.twitterDescription || config.description },
      { name: 'twitter:image', content: config.twitterImage || config.ogImage }
    ];

    twitterTags.forEach(tag => {
      if (tag.content) {
        this.updateOrAddTag('name', tag.name, tag.content);
      }
    });
  }

  /**
   * Updates additional meta tags
   */
  private updateAdditionalTags(config: DocumentHeadConfig): void {
    const additionalTags = [
      { name: 'theme-color', content: config.themeColor },
      { name: 'msapplication-TileColor', content: config.msapplicationTileColor },
      { name: 'msapplication-TileImage', content: config.msapplicationTileImage }
    ];

    additionalTags.forEach(tag => {
      if (tag.content) {
        this.updateOrAddTag('name', tag.name, tag.content);
      }
    });
  }

  /**
   * Updates custom meta tags
   */
  private updateCustomTags(config: DocumentHeadConfig): void {
    if (config.customTags) {
      config.customTags.forEach(tag => {
        if (tag.name) {
          this.updateOrAddTag('name', tag.name, tag.content);
        } else if (tag.property) {
          this.updateOrAddTag('property', tag.property, tag.content);
        } else if (tag.httpEquiv) {
          this.updateOrAddTag('http-equiv', tag.httpEquiv, tag.content);
        }
      });
    }
  }

  /**
   * Updates structured data (JSON-LD)
   */
  private updateStructuredData(config: DocumentHeadConfig): void {
    if (config.jsonLd && config.jsonLd.length > 0) {
      // Remove existing JSON-LD scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => script.remove());

      // Add new JSON-LD scripts
      config.jsonLd.forEach(data => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }
  }

  /**
   * Updates canonical URL
   */
  private updateCanonicalUrl(config: DocumentHeadConfig): void {
    if (config.canonical) {
      // Remove existing canonical link
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (existingCanonical) {
        existingCanonical.remove();
      }

      // Add new canonical link
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = config.canonical;
      document.head.appendChild(link);
    }
  }

  /**
   * Helper method to update or add meta tags
   */
  private updateOrAddTag(attrName: string, attrValue: string, content: string): void {
    const selector = attrValue ? `${attrName}="${attrValue}"` : attrName;
    
    if (this.metaService.getTag(selector)) {
      this.metaService.updateTag({ [attrName]: attrValue, content });
    } else {
      this.metaService.addTag({ [attrName]: attrValue, content });
    }
  }

  /**
   * Sets default meta tags that will be merged with page-specific meta tags
   * Useful for setting application-wide defaults
   */
  setDefaults(config: Partial<DocumentHeadConfig>): void {
    Object.assign(this.defaultConfig, config);
  }

  /**
   * Resets meta tags to default values
   */
  resetToDefaults(): void {
    this.updateHead({});
  }

  /**
   * Gets the current title
   */
  getCurrentTitle(): string {
    return this.titleService.getTitle();
  }

  /**
   * Gets the current meta tag content by name
   */
  getMetaContent(name: string): string | null {
    const tag = this.metaService.getTag(`name="${name}"`);
    return tag ? tag.content : null;
  }

  /**
   * Removes a specific meta tag
   */
  removeMetaTag(attrSelector: string): void {
    this.metaService.removeTag(attrSelector);
  }

  /**
   * Removes all dynamically added meta tags
   */
  removeAllDynamicTags(): void {
    const tagsToRemove = [
      'name="description"',
      'name="keywords"',
      'name="author"',
      'name="robots"',
      'property="og:title"',
      'property="og:description"',
      'property="og:image"',
      'property="og:url"',
      'property="og:type"',
      'property="og:site_name"',
      'property="og:locale"',
      'name="twitter:card"',
      'name="twitter:site"',
      'name="twitter:creator"',
      'name="twitter:title"',
      'name="twitter:description"',
      'name="twitter:image"',
      'name="theme-color"',
      'name="msapplication-TileColor"',
      'name="msapplication-TileImage"'
    ];

    tagsToRemove.forEach(tag => {
      this.metaService.removeTag(tag);
    });

    // Remove JSON-LD scripts
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    jsonLdScripts.forEach(script => script.remove());

    // Remove canonical link
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.remove();
    }
  }

  /**
   * Utility method to generate absolute URLs
   */
  getAbsoluteUrl(path: string): string {
    const baseUrl = window.location.origin;
    return path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}
