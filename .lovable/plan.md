

# Sign-In Screen Enhancements

## Changes to `src/pages/AuthPage.tsx`

### 1. Bigger ABM Logo
Change the logo from 48×48 to 80×80 pixels.

### 2. iOS Glass Effect on Card
Replace the solid `#161616` card background with a frosted glass style:
- `background: rgba(255,255,255,0.06)`
- `backdropFilter: "blur(24px) saturate(1.4)"`
- `WebkitBackdropFilter` for Safari
- Subtle semi-transparent border: `rgba(255,255,255,0.12)`
- Soft box shadow for depth

### 3. "Forgot Password?" Link
Add a "Forgot password?" button below the password field (visible only in sign-in mode). On click:
- Set a `forgotMode` state
- Show an email-only form that calls `supabase.auth.resetPasswordForEmail(email)`
- Display a success message confirming the reset email was sent
- Provide a "Back to sign in" link

### Files Changed
| File | Change |
|------|--------|
| `src/pages/AuthPage.tsx` | Add forgot password flow, enlarge logo, apply glass effect to card |

