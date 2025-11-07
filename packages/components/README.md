# @ecom/components

Shared UI components package with atomic design structure.

## Structure

```
src/
├── atoms/          # Basic building blocks (Button, Input, Label)
├── molecules/      # Simple combinations (FormField, SearchBar)
├── organisms/     # Complex components (ProductCard, Header)
└── index.js       # Main export file
```

## Using Component Libraries (DaisyUI, shadcn/ui, etc.)

### How It Works

Component libraries (DaisyUI, shadcn/ui, etc.) are installed **in this package** and then **wrapped/customized** in your atomic structure.

### Example: Using shadcn/ui

1. **Install in this package:**
   ```bash
   cd frontend/packages/components
   pnpm add class-variance-authority clsx tailwind-merge
   ```

2. **Create wrapper in atoms:**
   ```jsx
   // src/atoms/Button/Button.jsx
   import { cva } from 'class-variance-authority';
   import { cn } from '@/lib/utils'; // or from a utils file
   
   const buttonVariants = cva(/* shadcn button styles */);
   
   export function Button({ className, variant, ...props }) {
     return (
       <button
         className={cn(buttonVariants({ variant }), className)}
         {...props}
       />
     );
   }
   ```

3. **Export through atomic structure:**
   ```jsx
   // src/atoms/Button/index.js
   export { Button } from './Button';
   
   // src/atoms/index.js
   export * from './Button';
   ```

### Example: Using DaisyUI

1. **Install in this package:**
   ```bash
   cd frontend/packages/components
   pnpm add daisyui
   ```

2. **Use DaisyUI classes in your components:**
   ```jsx
   // src/atoms/Button/Button.jsx
   export function Button({ variant = 'primary', ...props }) {
     return (
       <button className={`btn btn-${variant}`} {...props} />
     );
   }
   ```

### Benefits

- ✅ **Single source of truth**: All component libraries in one place
- ✅ **Consistent API**: Your apps use `@ecom/components`, not the library directly
- ✅ **Easy to swap**: Change library without touching apps
- ✅ **Atomic structure**: Organize components logically
- ✅ **Customization**: Wrap libraries with your brand/design system

## Adding Components

1. Create component in appropriate folder (atoms/molecules/organisms)
2. Export from component's `index.js`
3. Export from folder's `index.js` (e.g., `src/atoms/index.js`)
4. Main `src/index.js` automatically exports everything

## Usage in Apps

```javascript
import { Button, Input, FormField } from '@ecom/components';
```

