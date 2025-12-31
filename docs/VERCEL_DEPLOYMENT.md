# Vercel Deployment Guide

Complete step-by-step guide for deploying the Next.js + Prisma + Supabase app to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Database Connection](#supabase-database-connection)
3. [Environment Variables](#environment-variables)
4. [Prisma Production Setup](#prisma-production-setup)
5. [Vercel Deployment Steps](#vercel-deployment-steps)
6. [Running Production Migrations](#running-production-migrations)
7. [Post-Deploy Smoke Tests](#post-deploy-smoke-tests)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ GitHub repository with your code pushed
- ✅ Supabase account with Postgres database created
- ✅ Vercel account (sign up at https://vercel.com if needed)
- ✅ Node.js 18+ installed locally (for running migrations)

---

## 1. Supabase Database Connection

### Finding Your Supabase Connection Strings

#### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com and sign in
2. Select your project

#### Step 2: Get Database Connection Details
1. In the left sidebar, click **"Settings"** (gear icon)
2. Click **"Database"** in the settings menu
3. Scroll down to **"Connection string"** section

You'll see two connection string options:

#### Option A: Direct Connection (Session Mode)
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Use this for:** Long-lived connections, migrations, admin tools
**Not recommended for:** Vercel serverless functions (too many connections)

#### Option B: Transaction Pooler (Recommended for Vercel) ⭐
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Use this for:** Vercel serverless functions (short-lived connections)
**Why:** Pooler manages connections efficiently, preventing "too many connections" errors

### Which Connection String to Use?

**For Vercel (DATABASE_URL):** Use the **Transaction Pooler** connection string.

**For Local Migrations:** You can use either, but the direct connection is fine.

### SSL Configuration

Supabase requires SSL connections. The connection strings above should include SSL parameters, but if you encounter SSL errors, append `?sslmode=require` to your connection string:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

### Getting Your Database Password

1. In Supabase Dashboard → Settings → Database
2. Under **"Database password"**, click **"Reset database password"** if you don't remember it
3. Save the password securely (you'll need it for the connection string)

---

## 2. Environment Variables

### Required Environment Variables for Vercel

Set these in Vercel Dashboard → Your Project → Settings → Environment Variables:

#### Database
```bash
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```
- Use the **Transaction Pooler** connection string from Supabase
- Replace `[PROJECT-REF]`, `[PASSWORD]`, and `[REGION]` with your actual values

#### Session Security
```bash
SESSION_SECRET=[GENERATE-A-STRONG-RANDOM-STRING]
```
- Generate a strong random string (at least 32 characters)
- **Never commit this to git!**
- Generate one using: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

#### Supabase Storage (if using photo uploads)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
SUPABASE_STORAGE_BUCKET=student-photos
SUPABASE_BUCKET_PUBLIC=false
STORAGE_PROVIDER=supabase
```

**Getting Supabase Credentials:**
1. Supabase Dashboard → Settings → API
2. **Project URL** → Copy to `NEXT_PUBLIC_SUPABASE_URL`
3. **service_role key** (secret) → Copy to `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Keep this secret!** Never expose in client-side code
   - This key bypasses Row Level Security (RLS)

**Note:** If you're not using photo uploads yet, you can skip the Supabase Storage variables and use `STORAGE_PROVIDER=local` (though local storage won't persist on Vercel).

### Environment Variables Summary Table

| Variable | Required | Description | Where to Find |
|----------|----------|-------------|---------------|
| `DATABASE_URL` | ✅ Yes | Supabase Postgres connection (pooler) | Supabase → Settings → Database → Connection string (Transaction Pooler) |
| `SESSION_SECRET` | ✅ Yes | Secret for signing session cookies | Generate locally with `openssl rand -base64 32` |
| `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ If using storage | Supabase project URL | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ If using storage | Supabase service role key | Supabase → Settings → API → service_role key |
| `SUPABASE_STORAGE_BUCKET` | ⚠️ If using storage | Storage bucket name | Default: `student-photos` |
| `SUPABASE_BUCKET_PUBLIC` | ⚠️ If using storage | Bucket visibility | `false` for private (recommended) |
| `STORAGE_PROVIDER` | ⚠️ If using storage | Storage provider | `supabase` for production |

---

## 3. Prisma Production Setup

### Verify Prisma Setup

✅ **Schema exists:** `/prisma/schema.prisma`  
✅ **Migrations exist:** `/prisma/migrations/*`  
✅ **Postinstall script:** Added `"postinstall": "prisma generate"` to `package.json`  
✅ **Migration script:** Added `"db:migrate:deploy": "prisma migrate deploy"` to `package.json`

### How Prisma Works on Vercel

1. **During `pnpm install` (or `npm install`):**
   - Vercel runs `postinstall` script automatically
   - `prisma generate` creates Prisma Client
   - ✅ Prisma Client is ready for your app

2. **During `next build`:**
   - Next.js builds your app
   - Prisma Client (generated in postinstall) is used
   - ✅ Build succeeds

3. **Migrations are NOT run automatically:**
   - You must run migrations manually (see [Running Production Migrations](#running-production-migrations))
   - ⚠️ **Never use `prisma db push` in production!** Always use migrations.

---

## 4. Vercel Deployment Steps

### Step 1: Import Your Repository

1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub/GitLab/Bitbucket repository
5. If prompted, authorize Vercel to access your repositories

### Step 2: Configure Project Settings

#### Framework Preset
- **Framework Preset:** Next.js (should auto-detect)
- Vercel will automatically detect Next.js and configure it

#### Root Directory
- Leave as **"."** (root) unless your Next.js app is in a subdirectory

#### Build and Output Settings
- **Build Command:** `next build` (default, already in package.json)
- **Output Directory:** `.next` (default)
- **Install Command:** `pnpm install` (or `npm install` if using npm)

#### Node.js Version
- **Node.js Version:** 18.x or 20.x (recommended: 20.x)
- You can set this in Vercel Dashboard → Settings → Node.js Version

### Step 3: Add Environment Variables

**Before deploying, add all environment variables:**

1. In the project import screen, expand **"Environment Variables"**
2. Add each variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Your Supabase pooler connection string
   - **Environment:** Select all (Production, Preview, Development)
3. Repeat for:
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL` (if using storage)
   - `SUPABASE_SERVICE_ROLE_KEY` (if using storage)
   - `SUPABASE_STORAGE_BUCKET` (if using storage)
   - `SUPABASE_BUCKET_PUBLIC` (if using storage)
   - `STORAGE_PROVIDER` (if using storage)

**Or add them later:**
1. After import, go to Project → Settings → Environment Variables
2. Add each variable
3. Redeploy after adding variables

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 2-5 minutes)
3. ✅ Your app will be live at `https://your-project.vercel.app`

### Step 5: Verify Build Success

Check the build logs for:
- ✅ `Running "postinstall" script`
- ✅ `Generated Prisma Client`
- ✅ `Creating an optimized production build`
- ✅ `Build completed`

If you see errors, see [Troubleshooting](#troubleshooting).

---

## 5. Running Production Migrations

### ⚠️ Important: Migrations Must Be Run Manually

Vercel does **NOT** run migrations automatically. You must run them yourself.

### Option A: Run Migrations Locally (Recommended) ✅

**This is the safest approach:**

1. **Get your production DATABASE_URL:**
   - Copy from Vercel Dashboard → Settings → Environment Variables
   - Or use your Supabase direct connection string (not pooler) for migrations

2. **Run migrations:**
   ```bash
   # Set DATABASE_URL temporarily
   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
   
   # Run migrations
   npx prisma migrate deploy
   ```

   **Or in one command:**
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" npx prisma migrate deploy
   ```

3. **Verify migrations:**
   ```bash
   DATABASE_URL="..." npx prisma migrate status
   ```

### Option B: Run Migrations from CI/CD (Advanced)

You can add a GitHub Action or similar to run migrations on deploy, but this is **NOT recommended** for production without careful testing.

### When to Run Migrations

- ✅ **Before first deploy:** Run all migrations to set up the database schema
- ✅ **After creating new migrations:** Run `prisma migrate deploy` locally against production
- ✅ **After pulling new migrations:** Run `prisma migrate deploy` locally against production

### Migration Best Practices

1. **Always test migrations locally first** against a copy of production data
2. **Run migrations during low-traffic periods** if possible
3. **Backup your database** before running migrations (Supabase Dashboard → Database → Backups)
4. **Never use `prisma db push` in production** - always use migrations

---

## 6. Post-Deploy Smoke Tests

### Public Routes

#### ✅ Home Page
- **URL:** `https://your-project.vercel.app/`
- **Expected:** Home page loads without errors

#### ✅ Enrollment Form
- **URL:** `https://your-project.vercel.app/enroll`
- **Test:**
  1. Fill out the enrollment form
  2. Submit
  3. **Expected:** Success message with `requestId` displayed
  4. Copy the `requestId` for next test

#### ✅ Enrollment Status Check
- **URL:** `https://your-project.vercel.app/enroll/status?requestId=[REQUEST-ID]`
- **Test:** Enter the `requestId` from previous step
- **Expected:** Shows enrollment request status (NEW, CONTACTED, APPROVED, or REJECTED)

### Admin Routes

#### ✅ Admin Login
- **URL:** `https://your-project.vercel.app/login`
- **Test:**
  1. Enter admin credentials (username/pin)
  2. Submit
  3. **Expected:** Redirects to `/admin/students` or admin dashboard

#### ✅ Approve Enrollment Request
- **URL:** `https://your-project.vercel.app/admin/requests`
- **Test:**
  1. Find the enrollment request from earlier
  2. Click "Approve"
  3. Fill in required fields (registrationNo, etc.)
  4. Submit
  5. **Expected:**
     - Request status changes to APPROVED
     - Student is created in database
     - `registrationNo` is set correctly

#### ✅ View Students
- **URL:** `https://your-project.vercel.app/admin/students`
- **Expected:** List of students (including the one you just approved)

### Student Routes

#### ✅ Student Login
- **URL:** `https://your-project.vercel.app/student/login`
- **Test:**
  1. Enter `registrationNo` and `phone` from approved enrollment
  2. Submit
  3. **Expected:** Redirects to `/student/dashboard`

#### ✅ Student Dashboard
- **URL:** `https://your-project.vercel.app/student/dashboard`
- **Expected:**
  - Shows only the logged-in student's data
  - No errors in console
  - Student info displays correctly

#### ✅ Student Results
- **URL:** `https://your-project.vercel.app/student/results`
- **Expected:** List of assessments/results for the student

#### ✅ Individual Result Page
- **URL:** `https://your-project.vercel.app/student/results/[assessmentId]`
- **Expected:** Detailed result page loads without errors

### Smoke Test Checklist

- [ ] Home page loads
- [ ] Enrollment form submits successfully
- [ ] Enrollment status page works
- [ ] Admin login works
- [ ] Admin can approve enrollment
- [ ] Approved enrollment creates student with registrationNo
- [ ] Student login works with registrationNo + phone
- [ ] Student dashboard shows only their data
- [ ] Student results pages work
- [ ] No console errors in browser
- [ ] No errors in Vercel function logs

---

## 7. Troubleshooting

### Build Failures

#### Error: "Prisma Client not generated"
**Solution:**
- Ensure `"postinstall": "prisma generate"` is in `package.json`
- Check build logs for postinstall script execution
- Verify Prisma is in `devDependencies` or `dependencies`

#### Error: "Cannot find module '@prisma/client'"
**Solution:**
- Ensure `@prisma/client` is in `dependencies` (not just `devDependencies`)
- Check that `prisma generate` ran during install

#### Error: "Node version mismatch"
**Solution:**
- Set Node.js version in Vercel Dashboard → Settings → Node.js Version
- Use Node.js 18.x or 20.x

### Runtime Failures

#### Error: "DATABASE_URL environment variable is not set"
**Solution:**
- Verify `DATABASE_URL` is set in Vercel Dashboard → Settings → Environment Variables
- Ensure it's set for the correct environment (Production, Preview, Development)
- Redeploy after adding environment variables

#### Error: "SSL connection required" or "Connection refused"
**Solution:**
- Ensure `DATABASE_URL` includes `?sslmode=require` (or `&sslmode=require` if other params exist)
- Use the Transaction Pooler connection string for Vercel
- Verify Supabase database is running (check Supabase Dashboard)

#### Error: "too many connections" or "connection pool exhausted"
**Solution:**
- **Switch to Transaction Pooler connection string** (see [Supabase Database Connection](#supabase-database-connection))
- The pooler manages connections efficiently for serverless functions
- Direct connection strings don't work well with Vercel's serverless architecture

#### Error: "Prisma migrate deploy" fails
**Solution:**
- Ensure migrations exist in `/prisma/migrations/`
- Check that `DATABASE_URL` points to the correct database
- Verify database user has permissions to create tables
- Run `prisma migrate status` to see current migration state

### Prisma-Specific Issues

#### Error: "Migration not found" or "Migration failed"
**Solution:**
- Ensure all migrations are committed to git
- Check that migration files exist in `/prisma/migrations/`
- Verify migration SQL is valid (check migration files)
- Run `prisma migrate status` to see which migrations are pending

#### Error: "Schema drift detected"
**Solution:**
- Your database schema doesn't match Prisma schema
- Run `prisma migrate dev` locally to create a new migration
- Then run `prisma migrate deploy` against production

### Supabase Storage Issues

#### Error: "Supabase client not initialized"
**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check that `STORAGE_PROVIDER=supabase` is set
- Ensure Supabase Storage bucket exists in Supabase Dashboard

#### Error: "Failed to upload file to Supabase"
**Solution:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (service_role key, not anon key)
- Check bucket name matches `SUPABASE_STORAGE_BUCKET`
- Ensure bucket exists and has correct permissions
- Check Supabase Dashboard → Storage for bucket configuration

### Session Issues

#### Error: "Session invalid" or "Unauthorized"
**Solution:**
- Verify `SESSION_SECRET` is set and matches across all environments
- Ensure `SESSION_SECRET` is a strong random string (32+ characters)
- Check that cookies are being set correctly (check browser DevTools → Application → Cookies)

### Getting Help

1. **Check Vercel Build Logs:**
   - Vercel Dashboard → Your Project → Deployments → Click deployment → View logs

2. **Check Vercel Function Logs:**
   - Vercel Dashboard → Your Project → Functions → View logs

3. **Check Supabase Logs:**
   - Supabase Dashboard → Logs → Postgres Logs / API Logs

4. **Test Locally:**
   - Set environment variables locally (`.env.local`)
   - Run `pnpm dev` and test the same functionality
   - If it works locally but not on Vercel, check environment variable configuration

---

## Quick Reference

### Essential Commands

```bash
# Generate Prisma Client (runs automatically on install)
pnpm prisma generate

# Run migrations against production
DATABASE_URL="..." npx prisma migrate deploy

# Check migration status
DATABASE_URL="..." npx prisma migrate status

# Build locally (test before deploying)
pnpm build

# Start production server locally (test)
pnpm start
```

### Environment Variables Checklist

- [ ] `DATABASE_URL` (Supabase Transaction Pooler)
- [ ] `SESSION_SECRET` (strong random string)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (if using storage)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (if using storage)
- [ ] `SUPABASE_STORAGE_BUCKET` (if using storage)
- [ ] `SUPABASE_BUCKET_PUBLIC` (if using storage)
- [ ] `STORAGE_PROVIDER` (if using storage)

### Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables set in Vercel
- [ ] Migrations run against production database
- [ ] Build succeeds on Vercel
- [ ] Smoke tests pass
- [ ] No errors in logs

---

## Next Steps

After successful deployment:

1. **Set up custom domain** (optional):
   - Vercel Dashboard → Settings → Domains
   - Add your domain and follow DNS instructions

2. **Set up monitoring:**
   - Enable Vercel Analytics
   - Set up error tracking (Sentry, etc.)

3. **Set up backups:**
   - Configure Supabase automated backups
   - Set up database backup schedule

4. **Optimize performance:**
   - Enable Vercel Edge Caching
   - Optimize images and assets
   - Consider Prisma Accelerate for database queries

---

**Need help?** Check the troubleshooting section or review Vercel/Supabase documentation.
