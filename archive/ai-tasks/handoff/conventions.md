# Code Conventions

## General
- No comments in code unless explicitly requested
- All file paths are relative (use ../ for parent directories)
- No backend endpoints (/api/) — this is pure HTML frontend

## HTML
- Use Tailwind utility classes for styling
- Semantic HTML5 elements (nav, main, section, article, footer)
- aria-* attributes for accessibility
- data-* attributes for JS hooks (e.g., data-cookie-banner, data-cookie-accept)

## CSS
- Custom CSS goes in assets/css/styles.css
- Use CSS custom properties (variables) for theming
- Tailwind classes preferred over custom CSS
- [dir="rtl"] selectors for Arabic RTL support (Phase 1.4)

## JavaScript
- Vanilla JS only (no frameworks)
- var keyword in quote-cart.js for compatibility
- let/const acceptable in other JS files
- localStorage for persistence (cart, language preference, cookie consent)
- Anime.js for animations (NOT GSAP)

## CMS Config (admin/config.yml)
- Owner-friendly labels (e.g., "Product Name" not "name")
- hint: on every field explaining what to fill
- summary: templates for informative list views
- description: on every collection
- No technical jargon — owners are non-technical

## Translations
- JSON format in assets/translations/{lang}.json
- Nested key structure matching page sections
- Placeholder syntax: {{key}} for dynamic values
- RTL-aware: Arabic strings must work with dir="rtl"

## Copyright
- All pages: (c) 2026 Ningbo Siyang Power Tools Co., Ltd.
