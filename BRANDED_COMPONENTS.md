# CLING & ORE Branded Components

## 🎨 Overview

All default Shofy components have been replaced with branded CLING & ORE components featuring:
- Premium typography (Inter + Playfair Display)
- Luxury color scheme using HSL tokens
- Gradient backgrounds and modern styling
- CLING & ORE specific content and branding

## 🏷️ Header Component (`src/layout/headers/header.jsx`)

### Branded Features:
- **Luxury Navigation**: Glassmorphism effect with backdrop blur
- **Gradient Top Bar**: Primary to secondary gradient with contact info
- **CLING & ORE Logo**: Updated with branded logo
- **Contact Information**: Saudi Arabia phone number and email
- **Social Links**: Facebook, Twitter, Instagram, YouTube
- **Category Button**: "Shop Jewelry" with luxury gradient styling
- **Shipping Info**: "Free Shipping on orders above SAR 400"

### Key Changes:
```jsx
// Top bar with gradient background
<div className="tp-header-top" style={{ 
  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)' 
}}>

// Contact information
<span className="text-white">
  <i className="fa-light fa-phone me-2"></i>
  +966-XXX-XXXX
</span>

// Luxury category button
<button className="tp-category-menu-btn btn-luxury" style={{ 
  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)', 
  border: 'none', 
  color: 'white' 
}}>
```

## 🎠 Hero Slider Component (`src/components/hero-banner/cling-ore-hero-slider.jsx`)

### Branded Features:
- **Gradient Backgrounds**: Dynamic gradients based on slide type
- **Luxury Typography**: Playfair Display for headings
- **CLING & ORE Content**: Premium jewelry-focused messaging
- **SAR Pricing**: Saudi Riyal currency
- **Luxury Buttons**: Gradient CTAs with hover effects

### Slider Content:
1. **Slide 1**: Premium Anti-Tarnish Jewelry Collection (SAR 89)
2. **Slide 2**: 18k Gold-Plated Necklaces & Pendants (SAR 149)
3. **Slide 3**: Luxury Bracelets & Earrings Collection (SAR 199)

### Key Features:
```jsx
// Dynamic gradient backgrounds
style={{ 
  background: item.is_light 
    ? "linear-gradient(135deg, hsl(var(--accent-pearl)) 0%, hsl(var(--accent-linen)) 100%)" 
    : "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)"
}}

// Luxury typography
<h3 className="tp-slider-title text-luxury-large" style={{ 
  color: item.is_light ? 'hsl(var(--foreground))' : 'white' 
}}>

// Luxury CTA button
<Link href="/shop" className="btn btn-luxury btn-lg">
  Shop Collection
</Link>
```

## 🦶 Footer Component (`src/layout/footers/footer.jsx`)

### Branded Features:
- **Newsletter Section**: Gradient background with subscription form
- **Organized Links**: Shop, Support, Company, Contact sections
- **CLING & ORE Contact**: Saudi Arabia location and contact details
- **Policy Links**: Return policy, privacy policy, etc.
- **Luxury Styling**: Gradient backgrounds and premium typography

### Footer Sections:

#### 1. Company Info
- CLING & ORE logo
- Brand description
- Social media links

#### 2. Shop Links
- All Jewelry
- Shoe Charms
- Men's Jewelry
- Women's Jewelry

#### 3. Support Links
- Jewelry Care
- FAQ
- Support
- Contact Us

#### 4. Company Links
- About Us
- Company Story
- Return Policy
- Privacy Policy

#### 5. Contact Info
- Phone: +966-XXX-XXXX
- Email: support@clingandore.com
- Location: Saudi Arabia
- Hours: Mon-Fri: 10AM-6PM AST

#### 6. Newsletter Section
```jsx
<div className="tp-footer-newsletter" style={{ 
  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)' 
}}>
  <h3 className="text-luxury-large text-white mb-3">Stay in Style</h3>
  <p className="text-white mb-0">
    Be the first to know about new collections, exclusive offers, and styling tips.
  </p>
  <form className="d-flex gap-3">
    <input type="email" className="input-luxury flex-grow-1" placeholder="Enter your email address" />
    <button type="submit" className="btn btn-luxury">Subscribe</button>
  </form>
</div>
```

## 🎯 Brand Consistency

### Color Scheme:
- **Primary**: `hsl(var(--primary))` - Main brand color
- **Secondary**: `hsl(var(--secondary))` - Supporting color
- **Accent Colors**: Pearl, linen, and other luxury tones
- **Gradients**: Primary to secondary for premium feel

### Typography:
- **Headings**: Playfair Display serif for luxury feel
- **Body Text**: Inter sans-serif for readability
- **Luxury Text**: Enhanced serif styling for premium elements

### Interactive Elements:
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Luxury input styling with focus states
- **Cards**: Premium styling with shadows and animations

## 🚀 Usage Examples

### Using the Branded Header:
```jsx
import Header from '@/layout/headers/header';

// Automatically includes:
// - CLING & ORE logo
// - Gradient top bar
// - Contact information
// - Social links
// - Luxury category button
```

### Using the Branded Hero Slider:
```jsx
import ClingOreHeroSlider from '@/components/hero-banner/cling-ore-hero-slider';

// Features:
// - 3 branded slides
// - Gradient backgrounds
// - Luxury typography
// - SAR pricing
// - Premium CTAs
```

### Using the Branded Footer:
```jsx
import Footer from '@/layout/footers/footer';

// Includes:
// - Newsletter subscription
// - Organized link sections
// - CLING & ORE contact info
// - Policy links
// - Luxury styling
```

## 🎨 Customization

### Adding New Slides:
```jsx
// In cling-ore-hero-slider.jsx
const clingOreSliderData = [
  // Add new slide objects here
  {
    id: 4,
    pre_title: { text: "Starting at", price: 299 },
    title: "New Collection Name",
    subtitle: { text_1: "Exclusive offer ", percent: 15, text_2: "off this week" },
    img: newHeroImage,
    green_bg: true,
  }
];
```

### Updating Contact Information:
```jsx
// In header.jsx and footer.jsx
// Update phone numbers, emails, and addresses as needed
```

### Modifying Colors:
```jsx
// Update HSL variables in globals.css
:root {
  --primary: '220 100% 50%';
  --secondary: '280 100% 60%';
  // ... other colors
}
```

## 📱 Responsive Design

All components are fully responsive and include:
- Mobile-optimized navigation
- Responsive typography scaling
- Touch-friendly buttons
- Optimized spacing for all screen sizes

## 🎯 Benefits

1. **Brand Consistency**: Unified CLING & ORE branding across all components
2. **Luxury Feel**: Premium styling that matches jewelry brand positioning
3. **Professional Appeal**: Modern design with sophisticated typography
4. **User Experience**: Intuitive navigation and clear information hierarchy
5. **Maintainability**: Modular components that are easy to update

The branded components create a cohesive, professional, and luxury-focused experience that perfectly represents CLING & ORE's premium anti-tarnish jewelry brand. 