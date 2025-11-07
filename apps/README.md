# Apps Directory

Platform-separated frontend applications.

## Structure

```
apps/
├── web/                    # Web applications (Next.js)
│   ├── namaste-fab/        # Namaste Fab web app (customer + admin)
│   └── marketplace/       # Marketplace web app
│
└── mobile/                # Mobile applications (React Native/Expo)
    ├── namaste-fab-mobile/ # Namaste Fab mobile app (customer only)
    └── alcohol-delivery/   # Alcohol delivery mobile app
```

## Platform Separation

### Web Apps (`apps/web/`)
- **Framework**: Next.js 14+ (App Router)
- **Target**: Browsers (desktop + mobile web)
- **Apps**:
  - `namaste-fab/` - Customer-facing web store + admin panel (protected routes)
  - `marketplace/` - Multi-seller marketplace platform

### Mobile Apps (`apps/mobile/`)
- **Framework**: React Native (Expo)
- **Target**: iOS & Android native apps
- **Apps**:
  - `namaste-fab-mobile/` - Customer mobile app for Namaste Fab
  - `alcohol-delivery/` - Alcohol delivery app with AR/VR features

## Development Commands

From `frontend/` root:

```bash
# Web apps
pnpm dev:namaste-fab    # Start Namaste Fab web
pnpm dev:marketplace    # Start Marketplace web

# Mobile apps
pnpm dev:namaste-fab-mobile  # Start Namaste Fab mobile
pnpm dev:alcohol        # Start Alcohol Delivery mobile

# All apps
pnpm dev                # Start all apps
```

## Adding New Apps

### Web App
```bash
cd apps/web
npx create-next-app@latest my-app --javascript --tailwind --app
```

### Mobile App
```bash
cd apps/mobile
npx create-expo-app@latest my-app --template blank
```

## Package Names

When creating apps, use these package names in `package.json`:
- Web: `@ecom/web-saree-shop`, `@ecom/web-marketplace`
- Mobile: `@ecom/mobile-saree-shop`, `@ecom/mobile-alcohol-delivery`

Or keep it simple: `saree-shop`, `marketplace`, etc. (Turborepo filters work with paths)

