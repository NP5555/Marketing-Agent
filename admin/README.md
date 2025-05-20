# Marketing Bot Admin Panel

Admin panel for managing the Telegram Marketing Bot. This application allows administrators to manage promotional offers, track referral links, and configure bot settings.

## Project Structure

```
admin/
├── client/         # React frontend
├── server/         # Express backend
└── shared/         # Shared types and utilities
```

## Tech Stack

- **Frontend**: React.js, TypeScript, Material-UI, Recharts
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account and project

### Environment Setup

1. Create a Supabase project and set up the database schema
2. Copy `.env.example` files to `.env` in both client and server directories
3. Update the environment variables with your Supabase credentials

### Database Setup

Run the SQL script in `server/src/db/schema.sql` in your Supabase SQL editor to create the required tables and policies.

### Client Setup

```bash
cd client
npm install
npm run dev
```

### Server Setup

```bash
cd server
npm install
npm run dev
```

## Features

- **Secure Admin Access**
  - JWT Authentication with Supabase
  - Role-based permissions (Admin/Moderator)
  - Activity audit logs

- **Offer Management System**
  - CRUD operations for promotional offers
  - Schedule offer time windows
  - Toggle offer visibility (active/inactive)
  - Auto-sync with Telegram bot messages

- **Link Generation Hub**
  - Create trackable referral links
  - View click-through analytics
  - Bulk CSV export/import

- **Bot Control Interface**
  - Manage message templates
  - Set response delay timing
  - Configure auto-reply rules
  - Monitor conversation metrics

- **Real-Time Dashboard**
  - User engagement statistics
  - Offer performance graphs
  - Bot usage analytics

## Integration with Telegram Bot

This admin panel integrates with the existing Telegram bot. The bot reads configuration and offer data from the same Supabase database to ensure consistency across the platform.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Offers
- `GET /api/offers` - List all offers
- `GET /api/offers/:id` - Get offer by ID
- `POST /api/offers` - Create new offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/offers/:id` - Delete offer
- `PATCH /api/offers/:id/toggle` - Toggle offer status

### Referral Links
- `GET /api/links` - List all links
- `GET /api/links/:code` - Get link by code
- `POST /api/links` - Create new link
- `DELETE /api/links/:code` - Delete link
- `GET /api/links/export` - Export links to CSV
- `POST /api/links/import` - Import links from CSV

### Bot Configuration
- `GET /api/bot-config` - List all configs
- `GET /api/bot-config/:key` - Get config by key
- `PUT /api/bot-config/:key` - Update config
- `GET /api/bot-config/messages/templates` - Get message templates
- `PUT /api/bot-config/messages/templates/:id` - Update message template 