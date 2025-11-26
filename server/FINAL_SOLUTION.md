# Final Solution: Connection Pooler Required

## Problem Summary

Your Direct connection URL (`db.ipvwbkpsusclfoovngid.supabase.co`) has two issues on Windows:

1. ✅ **DNS Resolution**: Works (resolves to IPv6)
2. ❌ **Network Connectivity**: Fails (`ENETUNREACH` - IPv6 not reachable)

This is a **Windows network configuration issue**, not a code issue.

## Solution: Use Connection Pooler

The **Connection Pooler** uses a different hostname format that works reliably on Windows.

## Steps to Fix

### 1. Get Connection Pooler String from Supabase

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Go to: **Settings → Database**
4. Scroll to **"Connection string"** section
5. Click **"Session"** tab (NOT Direct)
6. Copy the connection string

It will look like:
```
postgresql://postgres.ipvwbkpsusclfoovngid:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### 2. Update Your .env File

Replace your current `DATABASE_URL` with the Session pooler connection string:

```env
DATABASE_URL=postgresql://postgres.ipvwbkpsusclfoovngid:zpWl6K0XkGIPR1ed@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

**Important**: Replace `[REGION]` with the actual region from the connection string you copied.

### 3. Test Connection

```bash
npm run db:test
```

## Why This Works

- **Connection Pooler** uses `pooler.supabase.com` hostname
- This hostname resolves to IPv4 addresses that work on Windows
- Same functionality as Direct connection
- Better for production (handles connection pooling)

## Alternative: Fix Windows IPv6 (Not Recommended)

If you really want to use Direct connection, you would need to:
1. Enable IPv6 on Windows
2. Configure IPv6 routing
3. Ensure your network supports IPv6

This is complex and not recommended. **Connection Pooler is the better solution.**

## Quick Test

After updating to Connection Pooler, run:
```bash
npm run db:test
```

You should see: `✅ Connected to PostgreSQL server`

