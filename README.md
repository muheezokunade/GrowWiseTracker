# GrowWise Financial Tracker

GrowWise is a comprehensive financial management application designed specifically for small businesses.

## Deployment

This project is set up for deployment with:
- Frontend: Netlify
- Backend: Render
- Database: Neon PostgreSQL

### Frontend Deployment (Netlify)

1. Push your code to a GitHub repository
2. Log in to [Netlify](https://www.netlify.com/)
3. Click "New site from Git"
4. Select your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables:
   - `API_URL`: Your Render API URL (e.g., https://growwise-api.onrender.com)
   - `NODE_ENV`: production
7. Deploy the site

### Backend Deployment (Render)

1. Push your code to a GitHub repository
2. Log in to [Render](https://render.com/)
3. Click "New" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - Name: growwise-api
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add environment variables:
   - `NODE_ENV`: production
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `SESSION_SECRET`: A secure random string
7. Deploy the service

### Database Setup

The application uses Neon PostgreSQL. After setting up your Neon database:

1. Get your connection string from the Neon dashboard
2. Add it as the `DATABASE_URL` environment variable in Render
3. Run the database setup script once your backend is deployed by making a POST request to:
   ```
   https://your-render-url.onrender.com/api/setup
   ```

   You can use curl to make this request:
   ```bash
   curl -X POST https://your-render-url.onrender.com/api/setup
   ```

   This endpoint will create all necessary tables and seed the initial data, including demo users:
   - Username: demo
   - Password: admin

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## Features

- Financial transaction tracking
- Profit splitting and allocation
- Business growth goals
- Cash flow monitoring
- Expense categorization
- Financial reports
- Multi-currency support 