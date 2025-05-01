# Troubleshooting Guide for Kawaii Login System

## Common Issues

### Server Crashing

If your server is crashing, it's likely due to one of these issues:

1. **Database Connection Problems**
   - Check if your Neon Tech PostgreSQL database is active
   - Verify your database credentials in the `.env` file
   - Make sure the `DATABASE_URL` format is correct

2. **Port Already in Use**
   - If port 3001 is already being used, change the PORT value in your `.env` file

3. **Missing Environment Variables**
   - Ensure your `.env` file contains all required variables (see `.env.example`)

## How to Fix Database Connection Issues

1. **Check your Neon Tech Dashboard**
   - Log in to your Neon Tech account
   - Verify your database is active and not in suspended state
   - Check connection limits and quotas if using a free tier

2. **Verify Database Credentials**
   - Make sure your `DATABASE_URL` in `.env` has the correct:
     - Username
     - Password
     - Host
     - Database name

3. **Test Database Connection Separately**
   - Try connecting to your database using a tool like pgAdmin or DBeaver
   - If you can't connect with these tools, the issue is with your database, not your code

## Running the Server

To start the server with proper error output:

```bash
node server.js
```

Or using npm:

```bash
npm start
```

The server has been updated with better error handling to provide more helpful error messages instead of crashing immediately.

## Recent Changes Made to Fix Crashes

1. Added SSL configuration for PostgreSQL cloud providers
2. Improved error handling for database connection issues
3. Added graceful error handling for uncaught exceptions
4. Prevented immediate server exit on database connection failure

If you continue experiencing issues, please check your database provider's status page or contact their support.