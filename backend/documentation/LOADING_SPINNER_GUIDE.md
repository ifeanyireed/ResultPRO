# Unified Loading Spinner Component Guide

## Overview

All loading animations across the ResultsPro application now use a unified `LoadingSpinner` component from `@/components/LoadingSpinner.tsx`. This ensures consistent visual appearance and user experience throughout the application.

## Components Available

### 1. **LoadingSpinner** (Default)
Full-featured spinner for loading states with optional text display.

**Import:**
```tsx
import { LoadingSpinner } from '@/components/LoadingSpinner';
```

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` (default: 'md')
- `className?: string` - Additional Tailwind classes
- `inline?: boolean` - Display inline (default: flex column)
- `text?: string` - Optional loading text

**Usage Examples:**

```tsx
// Full page loading
if (loading) {
  return (
    <div className="flex items-center justify-center h-96">
      <LoadingSpinner size="lg" text="Loading dashboard..." />
    </div>
  );
}

// Without text
<LoadingSpinner size="md" />

// Custom sizing
<LoadingSpinner size="xl" />

// Inline variant
<div className="space-y-4">
  <LoadingSpinner size="sm" text="Processing..." inline />
</div>
```

### 2. **InlineLoadingSpinner**
Compact spinner for use within buttons and inline elements.

**Import:**
```tsx
import { InlineLoadingSpinner } from '@/components/LoadingSpinner';
```

**Props:**
- `size?: 'sm' | 'md'` (default: 'sm')

**Usage Examples:**

```tsx
// In a button
<button disabled={loading}>
  {loading ? (
    <>
      <InlineLoadingSpinner size="sm" />
      <span>Submitting...</span>
    </>
  ) : (
    <>
      <Save className="w-4 h-4" />
      <span>Submit</span>
    </>
  )}
</button>

// In form element
<div className="flex gap-2">
  <InlineLoadingSpinner />
  <span>Processing your request...</span>
</div>
```

### 3. **FullPageLoadingSpinner**
Overlay spinner for full-page loading states.

**Import:**
```tsx
import { FullPageLoadingSpinner } from '@/components/LoadingSpinner';
```

**Props:**
- `text?: string` - Optional loading message

**Usage Example:**

```tsx
if (isInitializing) {
  return <FullPageLoadingSpinner text="Initializing application..." />;
}
```

## Styling

All spinners use:
- **Icon:** Lucide React's `Loader2`
- **Animation:** `animate-spin` Tailwind class
- **Color:** `text-blue-600` (primary blue)
- **Duration:** 1000ms (standard Tailwind spin)

### Size Mapping

```
sm  → w-4 h-4     (16px)
md  → w-6 h-6     (24px)
lg  → w-8 h-8     (32px)
xl  → w-12 h-12   (48px)
```

## Migration Guide

### Before (Old Pattern)
```tsx
import { Loading01 } from '@hugeicons/react';

{loading && (
  <Loading01 className="w-5 h-5 animate-spin" />
)}
```

### After (New Pattern)
```tsx
import { InlineLoadingSpinner } from '@/components/LoadingSpinner';

{loading && (
  <InlineLoadingSpinner size="sm" />
)}
```

## Common Patterns

### 1. **Page Loading**
```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().finally(() => setLoading(false));
}, []);

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}
```

### 2. **Button Loading**
```tsx
<button disabled={loading} onClick={handleSubmit}>
  {loading ? (
    <>
      <InlineLoadingSpinner size="sm" />
      Saving...
    </>
  ) : (
    <>
      <Save className="w-4 h-4" />
      Save
    </>
  )}
</button>
```

### 3. **Content Area Loading**
```tsx
<CardContent>
  {loading ? (
    <div className="flex justify-center py-12">
      <LoadingSpinner size="md" text="Loading..." />
    </div>
  ) : (
    <div>{content}</div>
  )}
</CardContent>
```

### 4. **Dropdown Menu Loading**
```tsx
<DropdownMenuContent>
  {loading ? (
    <div className="p-4 flex justify-center">
      <LoadingSpinner size="sm" />
    </div>
  ) : (
    <DropdownMenuItems>{items}</DropdownMenuItems>
  )}
</DropdownMenuContent>
```

## Color Customization

To override the default blue color:

```tsx
<LoadingSpinner size="lg" className="text-red-600" />
```

## Benefits

✅ **Consistency** - Same animation across entire app  
✅ **Accessibility** - Uses semantic Lucide icons  
✅ **Flexibility** - Multiple sizes and inline variants  
✅ **Performance** - Single optimized component  
✅ **Maintainability** - Central location for updates  
✅ **Type Safety** - Full TypeScript support  

## All Updated Pages

The following pages have been updated to use the unified LoadingSpinner:

### Components
- `NotificationBell.tsx`
- `TicketSubmissionModal.tsx`

### Pages - School Admin
- `Overview.tsx`
- `SessionTermManagement.tsx`
- `BillingSubscription.tsx`
- `results-setup/steps/Step5StaffUploads.tsx`

### Pages - Super Admin
- `ScratchCardMgmt.tsx`
- `SupportDashboard.tsx`
- `SupportAgentDashboard.tsx`

### Pages - Public
- `Notifications.tsx`
- `ResultsLookup.tsx`
- `ScratchCardValidation.tsx`

### Pages - Auth
- `SchoolVerification.tsx`
- `VerifyEmail.tsx`
- `PasswordReset.tsx`
- `PasswordResetConfirm.tsx`
- `Login.tsx`
- `Register.tsx`

## Future Improvements

- [ ] Add skeleton loader variant for content placeholders
- [ ] Add progress indicator variant
- [ ] Add custom animation curve options
- [ ] Add accessibility announcements
- [ ] Add dark mode support with automatic color switching
