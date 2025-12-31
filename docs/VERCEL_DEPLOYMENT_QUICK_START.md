# Vercel Deployment - Quick Start Guide

**For detailed instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

## 🚀 Quick Deployment Steps

### 1. Get Supabase Connection String

1. Go to Supabase Dashboard → Settings → Database
2. Copy **Transaction Pooler** connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
   ```

### 2. Generate Session Secret

```bash
openssl rand -base64 32
# OR
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Get Supabase Storage Credentials (if using photo uploads)

1. Supabase Dashboard → Settings → API
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Deploy to Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repository
3. **Framework Preset:** Next.js (auto-detected)
4. **Node.js Version:** 20.x (in Settings)
5. **Environment Variables:** Add all variables (see below)
6. Click **Deploy**

### 5. Set Environment Variables in Vercel

Go to **Project → Settings → Environment Variables** and add:

```bash
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
SESSION_SECRET=[GENERATED-SECRET]
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SERVICE-ROLE-KEY]
SUPABASE_STORAGE_BUCKET=student-photos
SUPABASE_BUCKET_PUBLIC=false
STORAGE_PROVIDER=supabase
```

### 6. Run Migrations

**After first deploy, run migrations locally:**

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" npx prisma migrate deploy
```

### 7. Test Your Deployment

- ✅ Home: `https://your-project.vercel.app/`
- ✅ Enroll: `https://your-project.vercel.app/enroll`
- ✅ Admin Login: `https://your-project.vercel.app/login`
- ✅ Student Login: `https://your-project.vercel.app/student/login`

---

## 📋 Environment Variables Checklist

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | `postgresql://postgres.ref:pass@pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` |
| `SESSION_SECRET` | ✅ | `[32+ char random string]` |
| `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ | `https://ref.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | `eyJhbGci...` |
| `SUPABASE_STORAGE_BUCKET` | ⚠️ | `student-photos` |
| `SUPABASE_BUCKET_PUBLIC` | ⚠️ | `false` |
| `STORAGE_PROVIDER` | ⚠️ | `supabase` |

---

## 🔧 Common Issues

### Build fails: "Prisma Client not generated"
- ✅ Fixed: `postinstall` script added to `package.json`

### Runtime fails: "too many connections"
- ✅ Use **Transaction Pooler** connection string (not direct)

### SSL errors
- ✅ Add `&sslmode=require` to `DATABASE_URL`

### Migrations not applied
- ✅ Run `npx prisma migrate deploy` locally with production `DATABASE_URL`

---

## 📚 Full Documentation

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for:
- Detailed Supabase setup instructions
- Complete troubleshooting guide
- Post-deploy smoke tests
- Best practices
