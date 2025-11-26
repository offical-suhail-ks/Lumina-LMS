# Supabase Connection Troubleshooting

## Current Issue: DNS Resolution Failed (ENOTFOUND)

The hostname `db.ipvwbkpsusclfoovngid.supabase.co` cannot be resolved.

## Step-by-Step Troubleshooting

### 1. Check Project Status in Supabase Dashboard

**Most Common Issue: Project is Paused**

1. Go to https://supabase.com/dashboard
2. Check if your project shows as "Paused" or "Inactive"
3. If paused, click "Restore" or "Resume" to activate it
4. Wait a few minutes for the project to fully start

### 2. Verify Connection String

1. In Supabase Dashboard → Your Project → **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab (for Direct connection)
4. Make sure you're copying the **Direct connection** (not Session pooler or Transaction pooler)
5. The format should be:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 3. Check IP Restrictions

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection Pooling** or **Network Restrictions**
3. Check if there are IP allowlists enabled
4. If yes, either:
   - Add your current IP address
   - Or temporarily disable IP restrictions for testing

### 4. Verify Password Encoding

If your password contains special characters, they must be URL-encoded:

- `#` → `%23`
- `@` → `%40`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- Space → `%20`

**Example:**
If your password is `MyP@ss#123`, the connection string should be:
```
postgresql://postgres:MyP%40ss%23123@db.ipvwbkpsusclfoovngid.supabase.co:5432/postgres
```

### 5. Test Network Connectivity

Try pinging the hostname (if your system allows):
```bash
ping db.ipvwbkpsusclfoovngid.supabase.co
```

Or use nslookup:
```bash
nslookup db.ipvwbkpsusclfoovngid.supabase.co
```

### 6. Alternative: Use Connection Pooling

If Direct connection doesn't work, try the **Session pooler** connection string:

1. In Supabase Dashboard → **Settings** → **Database**
2. Under **Connection string**, select **Session** tab
3. Copy that connection string (uses port 5432)
4. Update your `.env` file

Or try **Transaction pooler**:
1. Select **Transaction** tab
2. Copy that connection string (uses port 6543)
3. Update your `.env` file

### 7. Check Supabase Status Page

Visit https://status.supabase.com to check if there are any ongoing issues.

## Quick Fix Checklist

- [ ] Project is active (not paused) in Supabase dashboard
- [ ] Connection string copied correctly from Supabase dashboard
- [ ] Password is properly URL-encoded if it has special characters
- [ ] No IP restrictions blocking your connection
- [ ] Internet connection is working
- [ ] Tried alternative connection methods (Session/Transaction pooler)

## Still Not Working?

If none of the above works:

1. **Create a new Supabase project** and try connecting to it
2. **Contact Supabase support** with your project reference ID
3. **Check your firewall/antivirus** - they might be blocking the connection
4. **Try from a different network** to rule out network issues

