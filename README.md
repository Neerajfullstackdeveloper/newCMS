# SalesDataTrackerPro

A sales data tracking application built with Node.js, Express, React, and PostgreSQL.

## Deployment Instructions for Render

### Prerequisites

- A Render account
- Your Neon PostgreSQL database (already set up)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Steps to Deploy

1. **Log in to Render**
   - Go to [render.com](https://render.com) and sign in to your account

2. **Create a New Web Service**
   - Click on "New" and select "Web Service"
   - Connect to your Git repository

3. **Configure the Web Service**
   - Name: Choose a name for your service (e.g., "datatrackpro")
   - Environment: Node
   - Region: Choose a region close to your users
   - Branch: main (or your preferred branch)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Set Environment Variables**
   - Add the following environment variables:
     - `NODE_ENV`: production
     - `DATABASE_URL`: Your Neon PostgreSQL connection string

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

6. **Access Your Application**
   - Once deployment is complete, you can access your application at the URL provided by Render

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your database connection string
4. Run the development server: `npm run dev`

## Project Structure

- `/client`: React frontend
- `/server`: Express backend
- `/shared`: Shared code between frontend and backend
- `/migrations`: Database migrations

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm start`: Start the production server
- `npm run check`: Run TypeScript type checking
- `npm run db:push`: Push schema changes to the database