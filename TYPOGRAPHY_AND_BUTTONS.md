# CLING & ORE Typography & Button System

## 🎨 Typography System

### Font Families

**Primary Font (Body Text):**
- `Inter` - Modern, clean sans-serif for body text and UI elements
- Fallbacks: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

**Heading Font (Luxury Serif):**
- `Playfair Display` - Elegant serif for headings and luxury elements
- Fallbacks: `Georgia, 'Times New Roman', serif`

### Typography Classes

```css
/* Base Typography */
body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

/* Heading Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Utility Classes */
.font-serif { font-family: 'Playfair Display', serif; }
.font-sans { font-family: 'Inter', sans-serif; }
.text-luxury { /* Luxury text styling */ }
.text-luxury-large { /* Large luxury text */ }
```

### Typography Scale

| Element | Font Size | Font Weight | Letter Spacing |
|---------|-----------|-------------|----------------|
| h1 | 2.5rem | 700 | -0.03em |
| h2 | 2rem | 600 | -0.02em |
| h3 | 1.75rem | 600 | -0.01em |
| h4 | 1.5rem | 600 | 0 |
| h5 | 1.25rem | 600 | 0 |
| h6 | 1.125rem | 600 | 0 |

## 🔘 Button System

### Base Button Styles

All buttons inherit from the `.btn` base class:

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: var(--radius);
  transition: all var(--transition-normal);
  cursor: pointer;
  user-select: none;
}
```

### Button Variants

#### Primary Button
```html
<button class="btn btn-primary">Primary Action</button>
```
- Background: `hsl(var(--primary))`
- Text: `hsl(var(--primary-foreground))`
- Border: `hsl(var(--primary-border))`
- Hover: Slight lift effect with enhanced shadow

#### Secondary Button
```html
<button class="btn btn-secondary">Secondary Action</button>
```
- Background: `hsl(var(--secondary))`
- Text: `hsl(var(--secondary-foreground))`
- Border: `hsl(var(--secondary-border))`

#### Outline Button
```html
<button class="btn btn-outline">Outline Action</button>
```
- Transparent background
- Primary color border and text
- Hover: Fills with primary color

#### Ghost Button
```html
<button class="btn btn-ghost">Ghost Action</button>
```
- Transparent background and border
- Subtle hover effect

#### Luxury Button
```html
<button class="btn btn-luxury">Luxury Action</button>
```
- Gradient background (primary to secondary)
- Enhanced shadow and animations
- Premium feel for CTAs

### Button Sizes

```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>
```

| Size | Padding | Font Size | Line Height |
|------|---------|-----------|-------------|
| sm | 0.5rem 1rem | 0.75rem | 1rem |
| Default | 0.75rem 1.5rem | 0.875rem | 1.25rem |
| lg | 1rem 2rem | 1rem | 1.5rem |
| xl | 1.25rem 2.5rem | 1.125rem | 1.75rem |

## 🎯 Luxury Jewelry Specific Styles

### Premium Text Styles
```css
.text-luxury {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.text-luxury-large {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
```

### Luxury Cards
```css
.card-luxury {
  background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 100%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
}

.card-luxury:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: hsl(var(--primary-border));
}
```

### Premium Form Elements
```css
.input-luxury {
  background-color: hsl(var(--background));
  border: 2px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  font-family: 'Inter', sans-serif;
  transition: all var(--transition-normal);
}

.input-luxury:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
  outline: none;
}
```

### Luxury Navigation & Footer
```css
.nav-luxury {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid hsl(var(--border));
}

.footer-luxury {
  background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%);
  border-top: 1px solid hsl(var(--border));
}
```

## 🎨 Usage Examples

### Hero Section
```html
<section class="section-luxury-large">
  <h1 class="text-luxury-large">Premium Anti-Tarnish Jewelry</h1>
  <p class="font-sans text-lg">Discover our collection of timeless pieces</p>
  <button class="btn btn-luxury btn-lg">Shop Collection</button>
</section>
```

### Product Cards
```html
<div class="card-luxury p-6">
  <h3 class="text-luxury mb-4">18k Gold Chain</h3>
  <p class="font-sans text-muted-foreground mb-6">Premium anti-tarnish finish</p>
  <button class="btn btn-primary">Add to Cart</button>
</div>
```

### Contact Form
```html
<form class="space-y-4">
  <input type="email" class="input-luxury w-full" placeholder="Your email" />
  <button type="submit" class="btn btn-primary w-full">Send Message</button>
</form>
```

## 🚀 Benefits

1. **Consistent Branding**: Unified typography and button system across all pages
2. **Luxury Feel**: Playfair Display serif adds sophistication to headings
3. **Accessibility**: Inter sans-serif ensures excellent readability
4. **Scalability**: Modular system that's easy to extend
5. **Performance**: Uses CSS custom properties for efficient theming
6. **Professional Appeal**: Enhanced visual hierarchy and spacing

## 🎯 Best Practices

1. **Use Playfair Display sparingly**: Reserve for headings and luxury elements
2. **Maintain contrast**: Ensure text meets WCAG accessibility standards
3. **Consistent spacing**: Use the provided spacing utilities
4. **Button hierarchy**: Use luxury buttons for primary CTAs only
5. **Responsive design**: Test typography at all breakpoints

This system creates a cohesive, professional, and luxury-focused design that perfectly suits CLING & ORE's premium jewelry brand positioning. 