# Dynamic Meta Tags Implementation

This Angular application demonstrates how to implement dynamic meta tags using Angular's Meta service for better SEO and social media sharing.

## Features

- **Dynamic Title Updates**: Automatically updates the page title
- **SEO Meta Tags**: Description, keywords, author meta tags
- **Open Graph Tags**: For Facebook and other social media platforms
- **Twitter Card Tags**: Optimized for Twitter sharing
- **Type Safety**: TypeScript interfaces for meta tag data
- **Service-based Architecture**: Reusable MetaService for all components

## Usage

### Basic Implementation

1. **Inject the MetaService** into your component:

```typescript
import { MetaService } from './services/meta.service';

constructor(private metaService: MetaService) {}
```

2. **Update meta tags** in your component:

```typescript
ngOnInit(): void {
  this.metaService.updateMetaTags({
    title: 'Your Page Title',
    description: 'Your page description',
    keywords: 'angular, meta, tags',
    type: 'article',
    image: '/path/to/image.jpg'
  });
}
```

### Available Meta Tag Options

```typescript
interface MetaTagData {
  title?: string; // Page title
  description?: string; // Page description
  keywords?: string; // SEO keywords
  author?: string; // Content author
  image?: string; // Social sharing image
  url?: string; // Canonical URL
  type?: string; // Content type (website, article, product)
  siteName?: string; // Site name for Open Graph
  twitterCard?: string; // Twitter card type
  twitterSite?: string; // Twitter site handle
  twitterCreator?: string; // Twitter creator handle
}
```

### Advanced Usage

#### Route-based Meta Tags

You can update meta tags based on route data:

```typescript
constructor(
  private metaService: MetaService,
  private route: ActivatedRoute
) {}

ngOnInit(): void {
  this.route.data.subscribe(data => {
    this.metaService.updateMetaTags(data.meta);
  });
}
```

#### Dynamic Content Meta Tags

For dynamic content like blog posts or products:

```typescript
loadBlogPost(id: string): void {
  this.blogService.getPost(id).subscribe(post => {
    this.metaService.updateMetaTags({
      title: post.title,
      description: post.excerpt,
      type: 'article',
      image: post.featuredImage,
      url: `${window.location.origin}/blog/${post.slug}`
    });
  });
}
```

## Demo

Visit `/demo` to see the meta tag service in action. The demo page includes buttons to simulate different types of content (blog posts, products, etc.) and shows how meta tags change dynamically.

## Testing

The service includes comprehensive unit tests. Run tests with:

```bash
ng test
```

## Best Practices

1. **Set default meta tags** in your main app component
2. **Update meta tags** in component's `ngOnInit` lifecycle hook
3. **Use consistent image sizes** for social sharing (1200x630px recommended)
4. **Include fallback values** for all meta tags
5. **Test social sharing** using tools like Facebook Debugger and Twitter Card Validator

## Social Media Validation Tools

- **Facebook**: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Files Structure

```
src/app/
├── services/
│   ├── meta.service.ts          # Main meta service
│   └── meta.service.spec.ts     # Service tests
├── components/
│   ├── page-example.component.ts     # Demo component
│   └── page-example.component.spec.ts # Component tests
├── app.ts                       # Main app component with default meta tags
└── app.routes.ts               # Routes configuration
```
