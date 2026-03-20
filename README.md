# Golf Charity Subscription Platform

A full-stack web application where golfers' scores become lottery numbers, with prizes and charity support.

## Features

- **Subscription System** - Monthly ($9.99) and Yearly ($99.99) plans via Stripe
- **Score Management** - Track Stableford scores (1-45), rolling 5-score system
- **Monthly Draws** - Automatic entries, match 3/4/5 numbers to win prizes
- **Charity Support** - Users select their charity, 10%+ of prize pool to charities
- **Winner Verification** - Proof upload with admin review
- **User Dashboard** - Scores, subscriptions, draws, winnings tracking
- **Admin Dashboard** - Full platform management

## Tech Stack

- **Frontend**: React + Vite, TailwindCSS, Framer Motion, React Query, Zustand
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: MySQL
- **Payments**: Stripe (Subscriptions, Checkout, Webhooks)
- **Auth**: JWT

## Project Structure

```
DigitalHeroes/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Seed data
│   ├── src/
│   │   ├── config/            # Database & Stripe config
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, validation, errors
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (draws, scheduling)
│   │   └── index.js           # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/        # Layout components
    │   ├── pages/             # Page components
    │   │   ├── dashboard/     # User dashboard pages
    │   │   └── admin/         # Admin dashboard pages
    │   ├── services/          # API client
    │   ├── store/             # Zustand auth store
    │   └── App.jsx            # Route definitions
    ├── .env.example
    └── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Stripe account (for payment processing)

### 1. Clone and Install

```bash
cd DigitalHeroes

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE golf_charity_db;"

# Or via MySQL Workbench / phpMyAdmin
# Create a new database named: golf_charity_db
```

### 3. Environment Configuration

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/golf_charity_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Create products in Stripe Dashboard, then add Price IDs
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_YEARLY_PRICE_ID="price_..."

PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Database Migration & Seed

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed initial data (admin user, charities, config)
npm run seed
```

### 5. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. In Stripe Dashboard:
   - Create 2 Products: "Monthly Subscription" and "Yearly Subscription"
   - Set recurring prices ($9.99/month and $99.99/year)
   - Copy the Price IDs to your `.env`
3. For webhooks (production):
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

### 6. Run the Application

**Development (2 terminals)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Access the app at: http://localhost:5173

### 7. Default Admin Account

```
Email: admin@golfcharity.com
Password: Admin@123
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions/checkout` - Create Stripe checkout
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/resume` - Resume cancelled subscription

### Scores
- `GET /api/scores` - Get user's scores
- `POST /api/scores` - Add new score
- `PUT /api/scores/:id` - Update score
- `DELETE /api/scores/:id` - Delete score

### Charities
- `GET /api/charities` - List all charities
- `GET /api/charities/:id` - Get charity details
- `POST /api/charities/select` - Select charity
- `GET /api/charities/my-charity` - Get user's selected charity

### Draws
- `GET /api/draws/current` - Get current draw
- `GET /api/draws/past` - Get past draws
- `POST /api/draws/enter` - Enter current draw
- `GET /api/draws/my-entry` - Get user's entry
- `GET /api/draws/my-winnings` - Get user's winnings

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/role` - Update user role
- `POST /api/admin/charities` - Create charity
- `PUT /api/admin/charities/:id` - Update charity
- `GET /api/admin/draws` - List all draws
- `POST /api/admin/draws/:id/execute` - Execute draw
- `GET /api/admin/verifications` - Pending winner verifications
- `PUT /api/admin/winners/:id/verify` - Verify winner
- `GET /api/admin/config` - Get prize pool config
- `PUT /api/admin/config` - Update prize pool config

## Scheduled Jobs

The backend runs automatic cron jobs:
- **1st of month**: Creates new monthly draw
- **15th of month**: Auto-enters eligible subscribers
- **Last day of month**: Executes the draw
- **Daily**: Checks for expired subscriptions

## Production Deployment

1. Set `NODE_ENV=production`
2. Use proper database with SSL
3. Set up Stripe webhook endpoint
4. Use environment variables for all secrets
5. Build frontend: `npm run build` (in frontend folder)
6. Serve frontend static files from backend or CDN

## License

MIT
