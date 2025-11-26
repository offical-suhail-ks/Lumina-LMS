# How to Get the Region for Supabase Connection String

## Method 1: From Connection String (Easiest)

When you copy the **Session** or **Transaction** pooler connection string from Supabase dashboard, the region is **already included** in the connection string!

The format is:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

**Example:**
```
postgresql://postgres.ipvwbkpsusclfoovngid:mypassword@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

In this example, the region is: `ap-southeast-1`

## Method 2: From Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click **Settings** (gear icon in left sidebar)
   - Click **General** (or look for project settings)

3. **Find Region Information**
   - Look for **"Region"** or **"Database Region"** field
   - Common regions include:
     - `us-east-1` (US East - N. Virginia)
     - `us-west-1` (US West - N. California)
     - `eu-west-1` (Europe - Ireland)
     - `eu-central-1` (Europe - Frankfurt)
     - `ap-southeast-1` (Asia Pacific - Singapore)
     - `ap-northeast-1` (Asia Pacific - Tokyo)
     - And many more...

## Method 3: From Connection String Section

1. **Go to Database Settings**
   - Settings → **Database**

2. **Check Connection String**
   - Scroll to **"Connection string"** section
   - Click on **Session** tab
   - The connection string shown will have the region in it:
     ```
     aws-0-[YOUR-REGION].pooler.supabase.com
     ```
   - Just copy the entire connection string - the region is already there!

## Method 4: From Project URL

Sometimes the region can be inferred from your project URL:
- If your project dashboard URL contains region info
- But this is less reliable - better to use Method 1 or 3

## Important Notes

- **You don't need to manually extract the region** - just copy the entire connection string from Supabase dashboard
- The connection string already has everything you need
- The region format is: `aws-0-[REGION]` (e.g., `aws-0-ap-southeast-1`)

## Quick Steps

1. Go to: **Settings → Database**
2. Scroll to **"Connection string"**
3. Click **Session** tab
4. **Copy the entire connection string** - it already includes the region!
5. Paste it into your `.env` file as `DATABASE_URL`

That's it! You don't need to figure out the region separately - it's already in the connection string.

