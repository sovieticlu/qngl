# ThemeService Documentation

## Overview

The `ThemeService` is a comprehensive theme management service for the SocialVariant Angular application. It provides robust theme handling, color management, and dynamic theming capabilities.

## Features

### 🎨 **Primary Color Management**

- **Get Primary Color**: Access current primary color as Observable or snapshot
- **Set Primary Color**: Update primary color dynamically
- **Color Variations**: Generate lighter, darker, and alpha variations

### 🎯 **Theme Presets**

- Built-in theme presets (Default, Dark Mode, Green Nature, Purple Professional)
- Easy preset switching with `applyPreset()`
- Custom theme creation capabilities

### 🌙 **Mode Management**

- Light/Dark/Auto mode support
- System preference detection for auto mode
- Dynamic mode switching with DOM updates

### ⚡ **Real-time Updates**

- Observable-based architecture
- Automatic DOM updates when theme changes
- CSS custom property injection

## API Reference

### Core Properties

```typescript
// Observables
themeState$: Observable<ThemeState>     // Current theme state
isDarkMode$: Observable<boolean>      // Dark mode status
primaryColor$: Observable<string>    // Primary color changes
accentColor$: Observable<string>     // Accent color changes

// Getters
getCurrentTheme(): Theme             // Current theme snapshot
getPrimaryColor(): string            // Current primary color
getAccentColor(): string            // Current accent color
getThemeMode(): 'light' | 'dark' | 'auto'
isDarkMode(): boolean               // Check if dark mode is active
```

### Color Management

```typescript
// Set colors
setPrimaryColor(color: string): void
setAccentColor(color: string): void
setCustomColors(primary: string, accent: string): void

// Color variations
generateColorVariations(baseColor: string): {
  base: string;
  light: string;
  lighter: string;
  dark: string;
  darker: string;
  alpha50: string;
  alpha25: string;
  alpha10: string;
}

// Shortcuts
getPrimaryColorVariations()
getAccentColorVariations()
```

### Theme Presets

```typescript
// Available presets
getAvailableThemes(): ThemePreset[]

// Apply preset
applyPreset(presetName: string): void

// Built-in presets:
// - "SocialVariant Default" - Clean blue theme
// - "Dark Mode" - Dark theme
// - "Green Nature" - Fresh green theme
// - "Purple Professional" - Professional purple theme
```

### Mode Management

```typescript
// Set mode
setThemeMode(mode: 'light' | 'dark' | 'auto'): void

// Toggle between light/dark
toggleTheme(): void

// Reset to default
resetToDefault(): void
```

## Usage Examples

### Basic Theme Management

```typescript
import { ThemeService } from './services/theme.service';

@Component({...})
export class MyComponent {
  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Listen to primary color changes
    this.themeService.primaryColor$.subscribe(color => {
      console.log('Primary color changed to:', color);
    });

    // Get current primary color
    const currentColor = this.themeService.getPrimaryColor();
  }

  // Change primary color
  changePrimaryColor() {
    this.themeService.setPrimaryColor('#ff6b6b');
  }

  // Apply preset
  applyDarkTheme() {
    this.themeService.applyPreset('Dark Mode');
  }

  // Toggle theme mode
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
```

### Template Usage

```html
<!-- Display current theme info -->
<div class="theme-info">
  <p>Current Theme: {{ (themeService.themeState$ | async)?.currentTheme }}</p>
  <p>Dark Mode: {{ (themeService.isDarkMode$ | async) ? 'On' : 'Off' }}</p>
  <p>
    Primary Color:
    <span [style.background-color]="themeService.primaryColor$ | async"> {{ themeService.primaryColor$ | async }} </span>
  </p>
</div>

<!-- Theme controls -->
<button (click)="themeService.setPrimaryColor('#007bff')">Blue Theme</button>
<button (click)="themeService.setPrimaryColor('#28a745')">Green Theme</button>
<button (click)="themeService.toggleTheme()">Toggle Dark Mode</button>
```

### Color Variations

```typescript
// Generate color variations for current primary color
const variations = this.themeService.getPrimaryColorVariations();

// Use variations in your component
const styles = {
  background: variations.base,
  border: variations.light,
  hover: variations.dark,
  shadow: variations.alpha25,
};
```

### Advanced Usage

```typescript
// Create custom theme
const customTheme = {
  name: "My Custom Theme",
  mode: "light" as const,
  primaryColor: "#ff6b6b",
  accentColor: "#4ecdc4",
};

// Apply custom colors
this.themeService.setCustomColors("#ff6b6b", "#4ecdc4");

// Listen to computed theme variables
const variables = this.themeService.getComputedThemeVariables();
```

## CSS Integration

The ThemeService automatically applies CSS custom properties to the document root:

```css
:root {
  --primary-color: #007bff;
  --primary-hover: #0056b3;
  --primary-active: #004085;
  --accent-color: #17a2b8;
  --background-primary: #ffffff;
  --text-primary: #212529;
  /* ... and many more */
}

/* Use in your CSS */
.my-button {
  background-color: var(--primary-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.my-button:hover {
  background-color: var(--primary-hover);
}
```

## Integration with State Management

The ThemeService integrates seamlessly with the `AppStateService`:

```typescript
// ThemeService uses AppStateService for persistence
// Theme state is automatically saved to localStorage
// Theme changes trigger state updates across the application
```

## Built-in Themes

### SocialVariant Default

- **Primary**: #007bff (Blue)
- **Accent**: #17a2b8 (Teal)
- **Mode**: Light

### Dark Mode

- **Primary**: #0d6efd (Bright Blue)
- **Accent**: #6610f2 (Purple)
- **Mode**: Dark

### Green Nature

- **Primary**: #28a745 (Green)
- **Accent**: #20c997 (Mint)
- **Mode**: Light

### Purple Professional

- **Primary**: #6f42c1 (Purple)
- **Accent**: #e83e8c (Pink)
- **Mode**: Light

## Browser Support

- All modern browsers
- CSS Custom Properties support required
- `prefers-color-scheme` media query for auto mode

## Performance

- Minimal overhead with RxJS observables
- Efficient DOM updates only when needed
- Debounced state persistence
- Lazy loading of theme presets

## Best Practices

1. **Use Observables**: Subscribe to theme changes for reactive UI updates
2. **CSS Variables**: Prefer CSS custom properties over inline styles
3. **Theme Persistence**: Theme preferences are automatically saved
4. **Mode Detection**: Use auto mode for system preference following
5. **Color Accessibility**: Ensure sufficient contrast ratios

## Related Services

- **AppStateService**: Core state management
- **DocumentHeadService**: Meta tag management
- **NotificationService**: User notifications

## Migration Guide

If migrating from a previous theme system:

1. Replace direct CSS modifications with ThemeService calls
2. Update templates to use theme observables
3. Convert theme switching to use presets or color setters
4. Remove manual localStorage theme management

## Troubleshooting

**Theme not applying**: Ensure CSS custom properties are used in stylesheets
**Mode detection failing**: Check browser support for `prefers-color-scheme`
**Performance issues**: Consider unsubscribing from observables in ngOnDestroy
