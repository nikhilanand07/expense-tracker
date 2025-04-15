# Backend Deployment Guide

This guide provides step-by-step instructions for deploying the Expense Tracker backend to Render.

## Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas account with a cluster set up

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
cd /Users/nikhilanand/CascadeProjects/expense-tracker
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/expense-tracker.git
git push -u origin main
```

### 2. Deploy to Render

1. Sign in to your Render account
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service with these settings:
   - **Name**: expense-tracker-api
   - **Environment**: Node
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your default branch)
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `NODE_ENV=production npm start`
   - **Plan**: Free

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:
- `NODE_ENV`: production
- `PORT`: 10000 (Render will override this, but it's good to set it)
- `MONGO_URI`: Your MongoDB Atlas connection string
  ```
  mongodb+srv://nikhilanand657:<YOUR_PASSWORD>@cluster0.p3l8feo.mongodb.net/expense-tracker?retryWrites=true&w=majority
  ```
- `JWT_SECRET`: Generate a secure random string
- `JWT_EXPIRE`: 30d

### 4. Deploy Your Service

Click "Create Web Service" and Render will automatically deploy your backend.

### 5. Test Your Deployment

Once deployed, test your API by visiting:
- `https://your-service-name.onrender.com/` (should show "Welcome to Expense Tracker API")
- `https://your-service-name.onrender.com/health` (should show status: "ok")

### 6. Update Frontend Configuration

After successful deployment, update your frontend configuration to point to your new backend URL:

```javascript
// In frontend/src/config.js
const config = {
  development: {
    apiUrl: 'http://localhost:5001'
  },
  production: {
    apiUrl: 'https://your-service-name.onrender.com'
  }
};
```

## Troubleshooting

- **Deployment Fails**: Check the build logs in Render for specific errors
- **Connection Issues**: Ensure your MongoDB Atlas IP whitelist allows connections from anywhere (0.0.0.0/0)
- **CORS Errors**: Update the CORS configuration in server.js with your frontend domain

## Next Steps

After deploying your backend, proceed to deploy your frontend to Netlify or Vercel following the instructions in the main DEPLOYMENT_GUIDE.md file.
