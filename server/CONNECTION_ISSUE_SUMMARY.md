# Connection Issue Diagnosis Summary

## Current Status

✅ **Connection String**: Correct format  
✅ **DNS Resolution**: Hostname resolves to IPv6 address  
❌ **Network Connection**: `ENETUNREACH` - Network is unreachable  

## Root Cause

The error `ENETUNREACH` when connecting to the resolved IPv6 address indicates that:

1. **Most Likely**: Your Supabase project is **PAUSED**
   - DNS still resolves (hostname exists)
   - But network endpoints are not active (can't connect)

2. **Less Likely**: IPv6 connectivity issue on your system
   - Your system might not have IPv6 enabled/configured
   - But this is less common

## Solution Steps

### Step 1: Check and Restore Supabase Project

1. Go to **https://supabase.com/dashboard**
2. Find your project (reference: `ipvwbkpsusclfoovngid`)
3. Check the project status:
   - If it shows **"Paused"** → Click **"Restore"** or **"Resume"**
   - Wait **2-3 minutes** for the project to fully start
4. Verify the project shows as **"Active"**

### Step 2: Test Connection After Restore

```bash
npm run db:test
```

### Step 3: If Still Not Working - Try Connection Pooling

If Direct connection still fails, try **Session Pooler**:

1. In Supabase Dashboard → **Settings** → **Database**
2. Under **Connection string**, select **Session** tab
3. Copy the connection string (format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`)
4. Update your `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres.ipvwbkpsusclfoovngid:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
5. Test again: `npm run db:test`

### Step 4: Alternative - Transaction Pooler

If Session pooler doesn't work, try **Transaction pooler**:

1. Select **Transaction** tab in Connection string section
2. Copy that connection string (uses port 6543)
3. Update `.env` and test

## Why This Happens

Supabase projects on free tier automatically pause after inactivity. When paused:
- DNS records still exist (so hostname resolves)
- But the actual database endpoints are shut down
- This causes `ENETUNREACH` or `ENOTFOUND` errors

## Prevention

- Keep your project active by using it regularly
- Or upgrade to a paid plan that doesn't pause
- Or use Connection Pooling which is more reliable

## Quick Checklist

- [ ] Project is **Active** (not paused) in Supabase dashboard
- [ ] Waited 2-3 minutes after restoring
- [ ] Connection string is correct (copied from dashboard)
- [ ] Password is properly URL-encoded if it has special characters
- [ ] Tried Session or Transaction pooler if Direct doesn't work

## Still Having Issues?

If the project is active and connection still fails:

1. **Check IP Restrictions**: Settings → Database → Network Restrictions
2. **Verify Connection String**: Make sure you copied the exact string from dashboard
3. **Test from Different Network**: Rule out network/firewall issues
4. **Contact Supabase Support**: If project is active but still can't connect

