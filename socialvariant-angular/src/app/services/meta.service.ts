import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/**
 * @deprecated Use DocumentHeadService instead for more comprehensive head management
 */
export interface MetaTagData {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
}

/**
 * @deprecated Use DocumentHeadService instead for more comprehensive head management
 * This service is kept for backward compatibility
 */
@Injectable({
  providedIn: 'root'
})
export class MetaService {

  constructor(
    private meta: Meta,
    private titleService: Title
  ) {}

  updateMetaTags(data: MetaTagData): void {
    // Update title
    if (data.title) {
      this.titleService.setTitle(data.title);
    }

    // Basic meta tags
    if (data.description) {
      this.updateTag('name', 'description', data.description);
    }

    if (data.keywords) {
      this.updateTag('name', 'keywords', data.keywords);
    }

    if (data.author) {
      this.updateTag('name', 'author', data.author);
    }

    // Open Graph meta tags
    if (data.title) {
      this.updateTag('property', 'og:title', data.title);
    }

    if (data.description) {
      this.updateTag('property', 'og:description', data.description);
    }

    if (data.image) {
      this.updateTag('property', 'og:image', data.image);
    }

    if (data.url) {
      this.updateTag('property', 'og:url', data.url);
    }

    if (data.type) {
      this.updateTag('property', 'og:type', data.type);
    } else {
      this.updateTag('property', 'og:type', 'website');
    }

    if (data.siteName) {
      this.updateTag('property', 'og:site_name', data.siteName);
    }

    // Twitter Card meta tags
    if (data.twitterCard) {
      this.updateTag('name', 'twitter:card', data.twitterCard);
    } else {
      this.updateTag('name', 'twitter:card', 'summary_large_image');
    }

    if (data.twitterSite) {
      this.updateTag('name', 'twitter:site', data.twitterSite);
    }

    if (data.twitterCreator) {
      this.updateTag('name', 'twitter:creator', data.twitterCreator);
    }

    if (data.title) {
      this.updateTag('name', 'twitter:title', data.title);
    }

    if (data.description) {
      this.updateTag('name', 'twitter:description', data.description);
    }

    if (data.image) {
      this.updateTag('name', 'twitter:image', data.image);
    }
  }

  private updateTag(attrName: string, attrValue: string, content: string): void {
    const selector = `${attrName}="${attrValue}"`;
    
    if (this.meta.getTag(selector)) {
      this.meta.updateTag({ [attrName]: attrValue, content });
    } else {
      this.meta.addTag({ [attrName]: attrValue, content });
    }
  }

  removeTag(attrName: string, attrValue: string): void {
    this.meta.removeTag(`${attrName}="${attrValue}"`);
  }

  removeAllCustomTags(): void {
    // Remove common meta tags that might be dynamically added
    const tagsToRemove = [
      'name="description"',
      'name="keywords"',
      'name="author"',
      'property="og:title"',
      'property="og:description"',
      'property="og:image"',
      'property="og:url"',
      'property="og:type"',
      'property="og:site_name"',
      'name="twitter:card"',
      'name="twitter:site"',
      'name="twitter:creator"',
      'name="twitter:title"',
      'name="twitter:description"',
      'name="twitter:image"'
    ];

    tagsToRemove.forEach(tag => {
      this.meta.removeTag(tag);
    });
  }
}
