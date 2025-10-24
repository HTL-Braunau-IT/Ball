# HTL Ball Ticketverkauf - Development Setup Guide

This guide will help you set up the HTL Ball Ticketverkauf application for local development.

## Prerequisites

- **Node.js** (version 22.x or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** database
- **Git**

## 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd HTL-Ball-Ticketverkauf

# Install dependencies
npm install
```

## 2. Database Setup

### Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE "htl-ball-ticketverkauf";

# Create user (optional)
CREATE USER htl_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE "htl-ball-ticketverkauf" TO htl_user;

# Exit psql
\q
```

## 3. Environment Configuration

### Copy Environment File
```bash
cp .env.example .env
```

### Configure Environment Variables
Edit `.env` file with your local settings:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/htl-ball-ticketverkauf"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe (Test Keys)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email Configuration (Office365)
EMAIL_SERVER_USER="your-email@domain.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="HTL Ball 2026 <noreply@htlball2026.com>"

# Optional
NEXT_PUBLIC_TICKET_SALE_DATE="2025-10-21T14:00:00"
```

### Generate NextAuth Secret
```bash
# Generate a secure secret
openssl rand -base64 32
```

## 4. Database Migration and Seeding

### Run Database Migrations
```bash
# Generate Prisma client and run migrations
npm run db:generate
```

### Seed Database with Initial Data
```bash
# Seed all required data (backend user, groups, delivery methods)
npm run db:seed-all
```

This command runs:
- `db:seed-backend-user` - Creates admin user for backend access
- `db:seed-buyer-groups` - Creates buyer groups
- `db:seed-delivery-methods` - Creates delivery methods
- `db:seed-groups` - Creates backend groups

## 5. Start Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at: `http://localhost:3000`

## 6. Access Points

### Frontend (Buyer Interface)
- **URL**: `http://localhost:3000`
- **Purpose**: Public ticket purchase interface

### Backend (Admin Interface)
- **URL**: `http://localhost:3000/backend`
- **Login**: Use the seeded backend user credentials
- **Purpose**: Admin panel for managing tickets, buyers, and reserves

## 7. Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Prisma Studio (database GUI)
npm run db:seed-all     # Seed all initial data

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format:check    # Check code formatting
npm run format:write    # Format code
npm run typecheck       # TypeScript type checking
npm run check           # Run linting and type checking
```

## 8. Database Management

### Prisma Studio
```bash
npm run db:studio
```
Opens a web interface to view and edit database data.

### Reset Database
```bash
# Drop and recreate database
npx prisma migrate reset

# Re-seed data
npm run db:seed-all
```

## 9. Testing Stripe Integration

### Test Cards
Use these test card numbers for Stripe testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Webhook
For local webhook testing, use tools like:
- [ngrok](https://ngrok.com/) to expose local server
- [Stripe CLI](https://stripe.com/docs/stripe-cli) for webhook forwarding

## 10. Troubleshooting

### Common Issues

**Database Connection Error**
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env file
- Ensure database exists

**Environment Variables Error**
- Make sure .env file exists and is properly formatted
- Check that all required variables are set
- Restart the development server after changes

**Build Errors**
- Run `npm run check` to identify issues
- Check TypeScript errors with `npm run typecheck`
- Fix linting issues with `npm run lint:fix`

**Permission Errors**
- Ensure database user has proper permissions
- Check file permissions in the project directory

### Getting Help

1. Check the console for error messages
2. Review the logs in the terminal
3. Use `npm run check` to identify code issues
4. Check the database with Prisma Studio

## 11. Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── backend/           # Admin interface
│   └── buyer/             # Public interface
├── components/            # React components
├── server/                # Server-side code
│   ├── api/              # tRPC routers
│   └── auth.ts           # NextAuth configuration
├── styles/               # Global styles
├── trpc/                 # tRPC client configuration
└── utils/                # Utility functions
```

## 12. Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run check` to ensure code quality
4. Test your changes thoroughly
5. Commit and push your changes
6. Create a pull request

---

**Happy coding! 🎉**

For questions or issues, please check the troubleshooting section or contact the development team.
