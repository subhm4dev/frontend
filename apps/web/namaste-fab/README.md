# Namaste Fab - Web Application

A modern e-commerce web application for selling beautiful Indian dresses and fabrics.

---

## 🏗️ What is This?

This is a **Next.js web application** that runs in your browser. Think of it like a website that:
- Shows products (sarees, dresses, fabrics)
- Lets customers browse and shop
- Has an admin panel to manage products
- Handles user login, registration, and shopping cart

---

## 📦 Where Does This Fit in the Big Picture?

This app is part of a **monorepo** (one big codebase with multiple apps and shared code).

```
ecommerce/
├── backend/              # Server-side code (Java microservices)
├── frontend/
│   ├── apps/
│   │   ├── web/
│   │   │   └── namaste-fab/    ← YOU ARE HERE (this app)
│   │   └── mobile/              # Mobile apps (React Native)
│   │
│   └── packages/               # Shared code used by all apps
│       ├── api-client/         # Code to talk to backend
│       ├── shared-schemas/     # Data validation rules
│       ├── utils/              # Helper functions
│       └── components/         # Reusable UI components
```

**Why a monorepo?**
- Share code between apps (don't repeat yourself)
- One place to manage everything
- Easier to keep things in sync

---

## 🔐 How Authentication Works (Simple Explanation)

### The Cookie Story 🍪

When you log in:
1. **You enter email/password** → Frontend sends to backend
2. **Backend checks credentials** → If correct, creates tokens (like a temporary ID card)
3. **Backend sets cookies** → Stores tokens in special "httpOnly" cookies (browser stores them, but JavaScript can't read them - more secure!)
4. **Browser automatically sends cookies** → Every time you visit a page, browser sends cookies to backend
5. **Backend checks cookies** → "Oh, you have valid cookies, you're logged in!"

**Why cookies instead of storing tokens in code?**
- More secure (JavaScript can't steal them)
- Automatic (browser handles it)
- Works across page refreshes

### Hybrid Approach (Web + Mobile)

- **Web browsers**: Use cookies (automatic, secure)
- **Mobile apps**: Use tokens in request headers (cookies don't work well in native apps)

The backend supports both! Same API, different ways to send tokens.

---

## 📁 Folder Structure (What's What?)

```
namaste-fab/
├── app/                    # Next.js pages (file-based routing)
│   ├── page.js            # Home page (public - anyone can browse)
│   ├── login/             # Login page (if needed)
│   ├── api/               # API routes (server-side code)
│   │   └── auth/
│   │       └── status/    # Check if user is logged in
│   └── layout.js        # Root layout (wraps all pages)
│
├── components/            # React components (reusable UI pieces)
│   ├── LoginModal.js     # Login popup
│   ├── RegisterModal.js  # Registration popup
│   └── AuthInitializer.js # Checks auth status on app load
│
├── stores/                # Zustand stores (client-side state)
│   └── auth-store.js      # Manages login/logout state
│
├── hooks/                 # Custom React hooks
│   └── useAuthModal.js    # Controls login/register modal visibility
│
├── lib/                   # Library configurations
│   └── react-query.js    # React Query setup (for server data)
│
└── middleware.js          # Runs on every request (reads cookies)
```

---

## 🛠️ Key Technologies & Why We Use Them

### 1. **Next.js** (The Framework)
- **What**: React framework with extra features
- **Why**: 
  - Fast page loads (server-side rendering)
  - Good for SEO (search engines can read pages)
  - Built-in routing (create a file = create a page)
  - API routes (can run server code)

### 2. **Zustand** (Client State)
- **What**: Lightweight state management
- **Why**: 
  - Simple (no complex setup)
  - Stores user info, login status, etc.
  - Persists to localStorage (survives page refresh)

### 3. **React Query** (Server State)
- **What**: Manages data from backend API
- **Why**:
  - Automatic caching (don't fetch same data twice)
  - Loading states (shows spinner while loading)
  - Error handling (shows error messages)
  - Refetching (updates data automatically)

### 4. **Axios** (API Client)
- **What**: Makes HTTP requests to backend
- **Why**:
  - Sends requests to backend Gateway
  - Handles cookies automatically
  - Error handling built-in

### 5. **Zod** (Validation)
- **What**: Validates data before sending to backend
- **Why**:
  - Catches errors early (before API call)
  - Type-safe (knows what data looks like)
  - Shared with backend (same rules)

### 6. **Tailwind CSS** (Styling)
- **What**: Utility-first CSS framework
- **Why**:
  - Fast to write (no separate CSS files)
  - Consistent design
  - Responsive (works on mobile + desktop)

---

## 🚀 How to Run This App

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

### Steps

1. **Navigate to frontend root**:
   ```bash
   cd "/Users/apple/Freelance Projects/ecommerce/frontend"
   ```

2. **Install dependencies** (first time only):
   ```bash
   pnpm install
   ```

3. **Start the app**:
   ```bash
   pnpm dev:namaste-fab
   ```

4. **Open browser**:
   - Go to [http://localhost:3000](http://localhost:3000)

### What Happens When You Run It?

1. **Next.js starts a dev server** on port 3000
2. **App loads** → `layout.js` wraps everything
3. **AuthInitializer runs** → Checks if you're logged in (reads cookies)
4. **Home page shows** → Public browsing or user dashboard

---

## 🔄 How Data Flows (The Journey of a Request)

### Example: User Logs In

```
1. User fills login form
   ↓
2. Form validates (Zod checks email/password format)
   ↓
3. auth-store.login() called
   ↓
4. api-client sends POST to backend Gateway
   ↓
5. Gateway forwards to IAM service
   ↓
6. IAM validates credentials
   ↓
7. IAM creates tokens + sets cookies
   ↓
8. Response comes back to frontend
   ↓
9. auth-store updates (user logged in, show dashboard)
   ↓
10. Cookies stored in browser (automatic)
```

### Example: User Visits Protected Page

```
1. User clicks link to protected page
   ↓
2. middleware.js runs (reads cookies)
   ↓
3. If cookie exists → Allow access
   If no cookie → Redirect to login
   ↓
4. Page loads → Shows content
```

---

## 🎯 Current Features

✅ **Authentication**
- Login (email/password)
- Registration
- Logout
- Cookie-based auth (secure)

✅ **Routing**
- Public pages (home page - anyone can browse)
- Protected pages (require login)
- Middleware checks auth on every request

✅ **State Management**
- User info stored in Zustand
- Persists to localStorage
- Syncs with cookies

---

## 📝 Development Workflow

### Adding a New Page

1. Create file in `app/` folder:
   ```
   app/products/page.js
   ```

2. That's it! Next.js automatically creates the route `/products`

### Adding a New Component

1. Create file in `components/`:
   ```
   components/ProductCard.js
   ```

2. Import and use:
   ```javascript
   import { ProductCard } from '@/components/ProductCard';
   ```

### Making API Calls

1. Use `api-client` from shared package:
   ```javascript
   import apiClient from '@ecom/api-client';
   
   const data = await apiClient.get('/api/v1/products');
   ```

2. Or use React Query (recommended for server data):
   ```javascript
   import { useQuery } from '@tanstack/react-query';
   
   const { data } = useQuery({
     queryKey: ['products'],
     queryFn: () => apiClient.get('/api/v1/products')
   });
   ```

---

## 🐛 Troubleshooting

### "Can't connect to backend"
- Make sure backend Gateway is running on port 8080
- Check CORS settings in Gateway

### "Cookies not working"
- Make sure `withCredentials: true` in api-client
- Check browser console for CORS errors
- Verify backend sets cookies correctly

### "User logged out after refresh"
- Check if `auth-store` has `persist` middleware
- Verify cookies are being set (check browser DevTools → Application → Cookies)

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🎨 Design Philosophy

- **Simple**: Easy to understand and maintain
- **Secure**: Cookies for web, tokens for mobile
- **Fast**: Server-side rendering, caching, optimizations
- **Scalable**: Shared packages, reusable components
- **User-Friendly**: Clear error messages, smooth flows

---

**Built with ❤️ for beautiful Indian fashion**
