# Guide: Creating a New Supabase Project

## Step-by-Step Instructions

### Step 1: Sign Up / Log In to Supabase

1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign in"** if you already have an account
3. Sign in with:
   - GitHub account (recommended)
   - Google account
   - Email and password

### Step 2: Create a New Project

1. Once logged in, you'll see your dashboard
2. Click the **"New Project"** button (usually green, top right or center)
3. Fill in the project details:

   **Project Details:**
   - **Name**: Give your project a name (e.g., "LMS Platform" or "My LMS")
   - **Database Password**: 
     - ⚠️ **IMPORTANT**: Choose a strong password
     - Save this password securely - you'll need it for the connection string
     - Example: `MySecurePassword123!`
   - **Region**: Select the region closest to you:
     - `Southeast Asia (Singapore)` - ap-southeast-1
     - `Southeast Asia (Sydney)` - ap-southeast-2
     - `US East (North Virginia)` - us-east-1
     - `US West (North California)` - us-west-1
     - `Europe (Ireland)` - eu-west-1
     - `Europe (Frankfurt)` - eu-central-1
     - And others...

4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be created

### Step 3: Get Your Connection String

Once your project is ready:

1. In your Supabase dashboard, click on your **project** (the one you just created)
2. Go to **Settings** (gear icon in the left sidebar)
3. Click **Database** in the settings menu
4. Scroll down to **"Connection string"** section
5. You'll see three tabs:
   - **URI** (Direct connection) - ⚠️ May have DNS issues on Windows
   - **Session** (Connection Pooler) - ✅ **Use this one!**
   - **Transaction** (Transaction Pooler) - Alternative option

6. Click on the **"Session"** tab
7. You'll see a connection string like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
8. Click the **copy icon** next to the connection string to copy it

### Step 4: Update Your .env File

1. Open `server/.env` in your project
2. Find or add the `DATABASE_URL` line
3. Paste the connection string you copied
4. Replace `[YOUR-PASSWORD]` with the actual password you set when creating the project

**Example:**
```env
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:MySecurePassword123!@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres
```

**Important Notes:**
- If your password contains special characters, they may need to be URL-encoded:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
  - `+` → `%2B`
  - `=` → `%3D`
  - Space → `%20`

### Step 5: Test Your Connection

1. Open terminal in your project
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Test the connection:
   ```bash
   npm run db:test
   ```

You should see:
```
✅ Connected to PostgreSQL server
🎉 Connection test successful!
```

## Quick Checklist

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Saved database password securely
- [ ] Selected appropriate region
- [ ] Waited for project to be created (2-3 minutes)
- [ ] Copied Session pooler connection string
- [ ] Updated `.env` file with connection string
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] URL-encoded any special characters in password
- [ ] Tested connection with `npm run db:test`

## Troubleshooting

### Connection Fails

1. **Check password**: Make sure you replaced `[YOUR-PASSWORD]` with your actual password
2. **Check URL encoding**: If password has special characters, encode them
3. **Check project status**: Make sure project is "Active" (not paused)
4. **Check connection string**: Make sure you copied from "Session" tab, not "URI" tab

### Project is Paused

- Free tier projects pause after inactivity
- Go to dashboard and click "Restore" or "Resume"
- Wait 2-3 minutes for project to start

### Can't Find Connection String

1. Go to: **Settings → Database**
2. Scroll down to **"Connection string"** section
3. Make sure you're on the **"Session"** tab
4. The connection string should be visible with a copy button

## Next Steps After Connection Works

1. **Initialize your database schema**:
   ```bash
   npm run db:init
   ```

2. **Start your server**:
   ```bash
   npm run dev
   ```

3. **Create your tables** (if you have a schema file)

## Tips

- **Use Session Pooler**: Always use the "Session" connection string for better Windows compatibility
- **Save Password**: Keep your database password in a secure password manager
- **Region Selection**: Choose a region close to your users for better performance
- **Free Tier**: Supabase free tier is generous, but projects may pause after inactivity

