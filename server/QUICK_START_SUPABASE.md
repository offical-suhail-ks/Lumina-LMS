# Quick Start: New Supabase Project

## 🚀 5-Minute Setup

### 1. Create Project (2 minutes)

1. Go to: **https://supabase.com**
2. Click **"Start your project"** → Sign in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `LMS Platform` (or any name)
   - **Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes

### 2. Get Connection String (1 minute)

1. In dashboard → Click your **project**
2. **Settings** → **Database**
3. Scroll to **"Connection string"**
4. Click **"Session"** tab
5. **Copy** the connection string

### 3. Update .env (1 minute)

1. Open `server/.env`
2. Add/update:
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with your actual password
4. Save file

### 4. Test (1 minute)

```bash
cd server
npm run db:test
```

Should see: ✅ **Connected successfully!**

## ⚠️ Important

- Use **Session** tab connection string (not URI/Direct)
- Replace `[YOUR-PASSWORD]` with actual password
- URL-encode special characters in password if needed
- Save your password securely!

## 🎉 Done!

Your database is ready. Next: `npm run db:init` to create tables.

