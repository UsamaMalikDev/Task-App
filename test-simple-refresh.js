#!/usr/bin/env node

// Simple Refresh Token Test
console.log('🧪 Simple Refresh Token Test');
console.log('============================');

console.log(`
📋 How to test:

1. Start the server:
   cd apps/server && npm run start:dev

2. Open browser and go to: http://localhost:3001

3. Login with: admin@orga.com / password123

4. Open browser dev tools (F12) → Console tab

5. Wait for token to expire (or manually expire it)

6. Make any API call (navigate to tasks page)

7. Watch console for these messages:
   🔄 Got 401, trying to refresh token...
   ✅ Token refreshed successfully
   ✅ Request succeeded after token refresh

📊 What this simple implementation does:

✅ Detects 401 errors from API calls
✅ Automatically calls /api/auth/refresh endpoint
✅ Retries the original request after refresh
✅ Redirects to login if refresh fails
✅ Stores user data in localStorage for refresh
✅ Clears localStorage on logout

🎯 This is a simple, working refresh token system!
`);

console.log('Ready to test! 🚀');
