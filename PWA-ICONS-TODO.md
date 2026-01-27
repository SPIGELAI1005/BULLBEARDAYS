# PWA Icons Required

The PWA manifest has been created, but the following icon files need to be generated from the existing logo assets:

## Required Icons

### Standard PWA Icons
- `public/icon-192.png` - 192x192px PNG (required)
- `public/icon-512.png` - 512x512px PNG (required)

### Additional Assets
- `public/og-image.png` - 1200x630px PNG for social sharing (Open Graph)
- `public/screenshot-wide.png` - 1280x720px for PWA app store listing
- `public/screenshot-narrow.png` - 750x1334px for PWA app store listing

## Source Assets Available

Located in `src/assets/`:
- `bullbeardays-logo.png` (1.5MB) - Main logo
- `bullbear-logo.png` (2.2MB) - Alternative logo
- `logo.jpeg` (114KB) - Compressed version

## Icon Generation Instructions

Use an image editor or online tool to:

1. **Create icon-192.png**:
   - Resize logo to 192x192px
   - Add padding if needed to prevent clipping
   - Save as PNG with transparency

2. **Create icon-512.png**:
   - Resize logo to 512x512px
   - Maintain consistent padding with 192px version
   - Save as PNG with transparency

3. **Create og-image.png**:
   - Create 1200x630px canvas
   - Add logo + tagline: "unBULLivable. unBEARable. PROFITable?"
   - Use brand colors (background: #0f1419, accent: #22c55e)
   - Save as PNG

### Quick Command (ImageMagick)

```bash
# Install ImageMagick first, then:
convert src/assets/bullbeardays-logo.png -resize 192x192 -background none -gravity center -extent 192x192 public/icon-192.png
convert src/assets/bullbeardays-logo.png -resize 512x512 -background none -gravity center -extent 512x512 public/icon-512.png
```

### Online Tools
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

## Service Worker (Optional Enhancement)

Consider adding a service worker for:
- Offline functionality
- Background sync
- Push notifications
- Cache management

Template available at: https://developers.google.com/web/tools/workbox
