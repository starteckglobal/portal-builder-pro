

# Password Change Feature

## Summary
Two changes: (1) reset the password for `starteckglobal@gmail.com` to `starteckglobal` via a database admin SQL call, and (2) add a "Change Password" option in the sidebar menu above the Sign Out button.

## Step 1: Reset Password
Use the Supabase admin API (via a one-time edge function call or direct SQL) to update the password for `starteckglobal@gmail.com` to `starteckglobal`. This will be done using `supabase.auth.admin.updateUserById()` in a quick edge function invocation or via the service role key.

## Step 2: Add Change Password UI
In the sidebar footer area of `ABMPortal.tsx` (around line 392-400), add a "Change Password" button above "Sign Out" that opens a small modal/dialog with:
- Current password field
- New password field  
- Confirm new password field
- Submit button that calls `supabase.auth.updateUser({ password: newPassword })`

The dialog will use the existing dark theme inline styles (C, F constants) to match the portal design. No new dependencies needed — `supabase.auth.updateUser()` handles password changes for logged-in users.

## Files Changed
| File | Action |
|------|--------|
| `src/components/ABMPortal.tsx` | Add Change Password button + modal dialog in sidebar footer |
| Edge function or admin call | One-time password reset for the specified account |

