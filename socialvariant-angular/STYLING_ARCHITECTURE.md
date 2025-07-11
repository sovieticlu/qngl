# Component-Level Styling Architecture

This Angular application uses a component-scoped CSS architecture for better maintainability, reusability, and performance.

## 🎯 Architecture Overview

### Global Styles (`src/styles.scss`)

Contains only truly global styles that apply to the entire application:

- CSS reset and normalization
- Body and HTML base styles
- Global accessibility styles (focus outlines)
- Utility classes for screen readers

### Component-Level Styles

Each component has its own scoped styles using Angular's ViewEncapsulation:

#### App Component (`app.scss`)

- Layout structure (flexbox for sticky footer)
- Header and navigation styles
- Footer styles
- Container utility for consistent max-width

#### Home Component (`home.component.ts` - inline styles)

- Hero section styling
- Feature cards grid
- Component-specific buttons
- Responsive design for home page

#### Page Example Component (`page-example.component.ts` - inline styles)

- Demo interface styling
- Meta controls styling
- Information display cards
- Component-specific interactions

## 🛠️ Shared Resources

### Variables (`src/app/styles/_variables.scss`)

Design tokens for consistent theming:

- Color palette
- Typography scale
- Spacing system
- Border radius values
- Shadow definitions

### Mixins (`src/app/styles/_mixins.scss`)

Reusable CSS patterns:

- Color variable mixins
- Container layouts
- Button styles
- Card components
- Responsive breakpoints

## 📱 Benefits of This Approach

### 1. **Scoped Styles**

- CSS is automatically scoped to components
- No style leakage between components
- Easier to maintain and debug

### 2. **Performance**

- Styles are bundled per component
- Unused styles are automatically tree-shaken
- Smaller initial bundle size

### 3. **Maintainability**

- Styles are co-located with components
- Easy to find and modify component-specific styles
- Clear separation of concerns

### 4. **Reusability**

- Shared variables and mixins for consistency
- Components can be moved between projects easily
- Design system approach

## 🎨 CSS Custom Properties

Each component defines its own CSS custom properties for:

- Color schemes
- Component-specific spacing
- Border radius and shadows
- Transition timing

Example:

```scss
:host {
  --primary-color: #007bff;
  --primary-hover: #0056b3;
  --border-radius: 0.375rem;
  --shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
```

## 📏 Responsive Design

### Mobile-First Approach

- Base styles for mobile devices
- Progressive enhancement for larger screens
- Consistent breakpoints across components

### Breakpoint Strategy

```scss
// Mobile: < 768px (base styles)
// Tablet: 768px - 991px
// Desktop: 992px+

@media (max-width: 768px) {
  // Tablet and mobile styles
}

@media (min-width: 992px) {
  // Desktop styles
}
```

## 🧩 Component Style Structure

Each component follows this pattern:

```scss
:host {
  // Component container styles
  // CSS custom properties
}

// Layout containers
.container {
}

// Major sections
.hero-section {
}
.features-section {
}

// UI elements
.btn {
}
.card {
}

// Responsive adjustments
@media (max-width: 768px) {
}
```

## 🚀 Usage Guidelines

### Adding New Components

1. Define component-specific CSS variables in `:host`
2. Use the container pattern for consistent layouts
3. Follow the BEM methodology for class naming
4. Include responsive styles for mobile/tablet/desktop

### Importing Shared Resources

```scss
// In component styles (if using external .scss files)
@import "../styles/variables";
@import "../styles/mixins";

.my-component {
  @include button-primary;
  color: $text-primary;
}
```

### Best Practices

- Use CSS custom properties for component theming
- Keep global styles minimal
- Prefer component-scoped styles over global utilities
- Use semantic class names
- Include hover and focus states for interactive elements

## 🔧 Development Workflow

1. **Design Component**: Plan the visual design and layout
2. **Define Variables**: Set up component-specific CSS custom properties
3. **Build Styles**: Create scoped styles using semantic class names
4. **Test Responsive**: Ensure component works on all screen sizes
5. **Optimize**: Remove unused styles and optimize for performance

This architecture ensures that styles are maintainable, performant, and truly component-scoped while maintaining design consistency across the application.
