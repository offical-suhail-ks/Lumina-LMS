# Use Supabase Connection Pooler (Recommended Solution)

## Problem
Node.js on Windows cannot resolve the Direct connection hostname (`db.ipvwbkpsusclfoovngid.supabase.co`), even though the database is active.

## Solution: Use Connection Pooler

Supabase provides Connection Pooling which uses a different hostname format that works better with Node.js on Windows.

## Steps to Get Pooler Connection String

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Database Settings**
   - Go to: **Settings** → **Database**
   - Scroll to **Connection string** section

3. **Copy Session Pooler Connection String**
   - Click on **Session** tab (NOT Direct or Transaction)
   - Copy the connection string
   - Format will be: `postgresql://postgres.ipvwbkpsusclfoovngid:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`
   - Notice: Uses `pooler.supabase.com` instead of `db.*.supabase.co`

4. **Update Your .env File**
   ```env
   DATABASE_URL=postgresql://postgres.ipvwbkpsusclfoovngid:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
   Replace `[YOUR_PASSWORD]` with your actual password (URL-encode special characters if needed)

5. **Test Connection**
   ```bash
   npm run db:test
   ```

## Why This Works

- **Different Hostname**: Pooler uses `pooler.supabase.com` which resolves better on Windows
- **Better DNS Resolution**: The pooler hostname is more reliable for Node.js DNS resolution
- **Same Functionality**: Works exactly the same as Direct connection for your application

## Alternative: Transaction Pooler

If Session pooler doesn't work, try **Transaction** pooler:
- Uses port **6543** instead of 5432
- Format: `postgresql://postgres.ipvwbkpsusclfoovngid:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

## Password URL Encoding

If your password has special characters, encode them:
- `#` → `%23`
- `@` → `%40`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- Space → `%20`

Example: If password is `MyP@ss#123`, use `MyP%40ss%23123` in the connection string.

