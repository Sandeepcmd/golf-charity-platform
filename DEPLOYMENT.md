# Deployment Guide: Vercel + Supabase

This guide explains how to deploy the Golf Charity Platform to Vercel with Supabase as the database.

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Supabase Account](https://supabase.com)
- [GitHub Account](https://github.com) (to push your code)
- Stripe Account with live/test keys

---

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `golf-charity-db`
   - **Database Password**: (save this password!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait for the project to be ready (1-2 minutes)

### 1.2 Get Database Connection Strings

1. Go to **Settings** > **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy both:
   - **Connection pooling** (Mode: Transaction) → This is your `DATABASE_URL`
   - **Direct connection** → This is your `DIRECT_URL`

Example format:
```
postgresql://postgres:[Sandeep@159075300]@db.qjrdwfmhuzwaxryfsvpy.supabase.co:5432/postgres
```
postgresql://postgres.qjrdwfmhuzwaxryfsvpy:[Sandeep@159075300]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres

Replace `[PASSWORD]` with your database password.

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository

```bash
cd DigitalHeroes
git init
git add .
git commit -m "Initial commit"
```

### 2.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `golf-charity-platform`
3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/golf-charity-platform.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Vercel

### 3.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `golf-charity-platform` repository
4. **Important**: Set **Root Directory** to `backend`
5. Click **"Deploy"** (it will fail - that's ok, we need to add env vars)

### 3.2 Configure Environment Variables

1. Go to your project **Settings** > **Environment Variables**
2. Add all these variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase pooling connection string |
| `DIRECT_URL` | Your Supabase direct connection string |
| `JWT_SECRET` | A long random string (use a password generator) |
| `JWT_EXPIRES_IN` | `7d` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |
| `STRIPE_MONTHLY_PRICE_ID` | Your monthly price ID |
| `STRIPE_YEARLY_PRICE_ID` | Your yearly price ID |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` (update after frontend deploy) |

3. Click **"Redeploy"** from the Deployments tab

### 3.3 Run Database Migration

After successful deployment, run the migration:

```bash
# Locally, with production DATABASE_URL
cd backend
DATABASE_URL="your-supabase-url" npx prisma db push
DATABASE_URL="your-supabase-url" npm run seed
```

Or use Vercel CLI:
```bash
npm i -g vercel
vercel env pull
npx prisma db push
npm run seed
```

### 3.4 Note Your Backend URL

Your backend will be at: `https://your-project-name.vercel.app`

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Import Project (Again)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select the **same repository**
3. **Important**: Set **Root Directory** to `frontend`
4. Configure environment variables before deploying

### 4.2 Configure Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend-project.vercel.app/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |

### 4.3 Update Frontend vercel.json

Before deploying, update `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND-URL.vercel.app/api/:path*"
    }
  ]
}
```

Replace `YOUR-BACKEND-URL` with your actual backend Vercel URL.

### 4.4 Deploy

Click **"Deploy"**

---

## Step 5: Configure Stripe Webhooks

### 5.1 Add Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) > **Developers** > **Webhooks**
2. Click **"Add endpoint"**
3. Enter: `https://your-backend.vercel.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your backend Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
8. Redeploy the backend

---

## Step 6: Update CORS Settings

Go to your backend Vercel project > Settings > Environment Variables

Update `FRONTEND_URL` to your actual frontend URL:
```
FRONTEND_URL=https://your-frontend.vercel.app
```

Redeploy the backend.

---

## Step 7: Verify Deployment

### Test Checklist:

1. **Frontend loads**: Visit your frontend URL
2. **API works**: Visit `https://your-backend.vercel.app/api/health`
3. **Registration**: Create a new account
4. **Login**: Log in with the account
5. **Stripe**: Complete a test subscription (use test card `4242 4242 4242 4242`)
6. **Admin**: Log in as `admin@golfcharity.com` / `Admin@123`

---

## Troubleshooting

### Database connection issues
- Ensure you're using the **pooling** URL for `DATABASE_URL`
- Ensure `?pgbouncer=true` is in the URL
- Check Supabase dashboard for connection limits

### CORS errors
- Verify `FRONTEND_URL` is set correctly in backend
- Ensure no trailing slash in the URL

### Stripe webhook failures
- Check the webhook secret is correct
- Verify the endpoint URL is correct
- Check Vercel function logs for errors

### Build failures
- Check Vercel build logs
- Ensure all environment variables are set
- Run `npm run build` locally first to catch errors

---

## Environment Variables Summary

### Backend (Vercel)
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.vercel.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Custom Domain (Optional)

1. Go to your Vercel project > **Settings** > **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in backend and redeploy
