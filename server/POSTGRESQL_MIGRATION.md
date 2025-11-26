# PostgreSQL Migration Guide

## Changes Made

The database has been migrated from MariaDB to PostgreSQL (Supabase). The following files have been updated:

### Core Database Files
- ✅ `server/package.json` - Replaced `mariadb` with `pg` package
- ✅ `server/src/db.js` - Updated to use PostgreSQL connection pool
- ✅ `server/src/config/database.js` - Updated to use PostgreSQL
- ✅ `server/src/test-connection.js` - Updated for PostgreSQL testing
- ✅ `server/src/index.js` - Updated database references

### Key Changes
1. **Connection Pool**: Now uses `pg.Pool` instead of `mariadb.createPool`
2. **Placeholder Conversion**: Added automatic conversion from MySQL `?` placeholders to PostgreSQL `$1, $2, etc.`
3. **Result Compatibility**: Query results now include `affectedRows` (mapped from `rowCount`) for compatibility
4. **Connection String Support**: Supports both `DATABASE_URL` connection string and individual environment variables

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

This will install the `pg` package and remove `mariadb`.

### 2. Configure Environment Variables

Create or update your `.env` file in the `server` directory with your Supabase connection string:

**Option 1: Using Connection String (Recommended)**
```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.ipvwbkpsusclfoovngid.supabase.co:5432/postgres
```

**Option 2: Using Individual Variables**
```env
DB_HOST=db.ipvwbkpsusclfoovngid.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[YOUR_PASSWORD]
DB_NAME=postgres
```

**Important**: Replace `[YOUR_PASSWORD]` with your actual Supabase database password.

### 3. Test Connection

Test your database connection:

```bash
npm run db:test
```

### 4. SSL Configuration

Supabase requires SSL connections. The code is configured to use SSL in production mode. If you need to adjust SSL settings, modify the `poolConfig` in `server/src/db.js`.

## Important Notes

### SQL Syntax Differences

PostgreSQL has some syntax differences from MySQL/MariaDB:

1. **Placeholders**: The code automatically converts `?` to `$1, $2, etc.`, but be aware:
   - This simple conversion may fail if `?` appears in string literals or comments
   - If you encounter issues, you may need to manually update SQL queries

2. **Backticks vs Quotes**: 
   - MySQL uses backticks (`` ` ``) for identifiers
   - PostgreSQL uses double quotes (`"`) for identifiers
   - Most queries should work, but you may need to update schema files

3. **Functions**: Some MySQL-specific functions may need to be replaced:
   - `NOW()` → Works in both
   - `IFNULL()` → Use `COALESCE()` in PostgreSQL
   - `LIMIT/OFFSET` → Works in both

### Schema Migration

If you have existing schema files (`database/schema.sql`), you may need to:
1. Convert MySQL-specific syntax to PostgreSQL
2. Update data types (e.g., `TEXT`, `VARCHAR` work in both)
3. Review foreign key constraints
4. Update `AUTO_INCREMENT` to `SERIAL` or `GENERATED ALWAYS AS IDENTITY`

### Database Initialization

The `database/init.js` file still uses MariaDB syntax. You may need to:
1. Update it to use PostgreSQL connection
2. Convert SQL schema syntax
3. Update table creation statements

## Troubleshooting

### Connection Issues
- Verify your Supabase connection string is correct
- Check that your IP is allowed in Supabase dashboard (if IP restrictions are enabled)
- Ensure SSL is properly configured

### Query Errors
- Check for MySQL-specific syntax in your queries
- Verify placeholder conversion is working correctly
- Review PostgreSQL error messages for specific syntax issues

### Migration Scripts
Many migration scripts in `database/` folder still reference MariaDB. These will need to be updated if you plan to use them with PostgreSQL.

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Update `.env` with your Supabase connection string
3. ✅ Test connection: `npm run db:test`
4. ⚠️ Review and update schema files if needed
5. ⚠️ Test your application endpoints
6. ⚠️ Update migration scripts if you plan to use them

## Support

If you encounter issues:
1. Check PostgreSQL error messages in the console
2. Verify your connection string format
3. Review Supabase connection logs
4. Test with a simple query first

