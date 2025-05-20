# Gram Admin Panel and Dashboard

A full-stack web application for managing content (offers, projects, news) and displaying it on a public dashboard. Designed to integrate with Telegram bots by providing linkable content sections.

## Features

### Admin Panel
- Secure login for admins using Supabase Auth
- Content management for offers, projects, and news
- Image uploads via Supabase Storage
- Responsive interface with forms and tables

### Public Dashboard
- Modern, responsive design using Tailwind CSS
- Sections for offers, projects, and news
- Dynamic data loading from the backend
- Linkable sections for Telegram bot integration (e.g., `https://your-domain.com/#offers`)

## Preview

Here are some screenshots of the application:

![Preview 1](src/assets/prview%20for%20readme1.png)
*Admin Panel Dashboard*

![Preview 2](src/assets/prview%20for%20readme2.png)
*Content Management Interface*

![Preview 3](src/assets/prview%20for%20readme3.png)
*Public Dashboard View*

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS (via CDN)
- Axios
- Supabase JavaScript Client

### Backend
- Node.js
- Express.js
- Supabase (Auth, Database, Storage)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Create the following tables in your Supabase database:

```sql
CREATE TABLE offers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image_url VARCHAR(255),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Set up authentication:
   - Enable Email/Password Sign-In under Authentication > Providers
   - Create an admin user in the Authentication > Users section

4. Create a storage bucket named `content-images` under Storage

5. Configure Row Level Security (RLS) for your tables and storage
   - For public tables (offers, projects, news): Allow public read access but restrict write access to authenticated users
   - For storage: Allow authenticated uploads to the content-images bucket

## Installation and Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/gram-admin-dashboard.git
cd gram-admin-dashboard
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Configure environment variables:

Backend (.env):
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key
PORT=3000
```

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Running the Application

### Development Mode

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server in a new terminal
```bash
cd frontend
npm start
```

3. Access the application:
   - Dashboard: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

### Production Deployment

#### Backend (Render)
1. Push the backend code to a GitHub repository
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add your SUPABASE_URL, SUPABASE_KEY, and PORT

#### Frontend (Render)
1. Push the frontend code to a GitHub repository
2. Create a new Static Site on Render
3. Connect your GitHub repository
4. Configure the service:
   - Build Command: `npm run build`
   - Publish Directory: `build`
   - Environment Variables: Add your REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, and set REACT_APP_API_URL to your backend URL

## Telegram Bot Integration

To integrate with Telegram bots, provide direct links to dashboard sections:

- Offers: `https://your-domain.com/#offers`
- Projects: `https://your-domain.com/#projects`
- News: `https://your-domain.com/#news`

Example bot command:
```
User: Show me current offers
Bot: Check out our special offers here: https://your-domain.com/#offers
```

## License

MIT 