# Expense Tracker Deployment Guide

This guide provides step-by-step instructions for deploying the Expense Tracker application, including the backend API, web frontend, and mobile app.

## Application Components

The Expense Tracker consists of three main components:

1. **Backend API**: Node.js/Express.js with MongoDB
2. **Web Frontend**: React with Bootstrap
3. **Mobile App**: React Native with Expo

## 1. Backend Deployment

### 1.1 Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (the free tier is sufficient)
3. Set up a database user with a secure password
4. Configure network access (IP whitelist) to allow connections from anywhere (0.0.0.0/0)
5. Get your connection string, which will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```

### 1.2 Deploy to Render

[Render](https://render.com/) offers a free tier for web services that's perfect for our backend.

1. Sign up for a Render account
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository or use the "Public Git repository" option
4. Configure the service:
   - **Name**: expense-tracker-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add the following environment variables:
   - `PORT`: 5001
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT token encryption
   - `JWT_EXPIRE`: 30d

6. Click "Create Web Service"

### 1.3 Alternative: Deploy to Railway

[Railway](https://railway.app/) is another excellent platform for Node.js applications.

1. Sign up for a Railway account
2. Create a new project
3. Add a service from GitHub
4. Configure environment variables (same as above)
5. Deploy

## 2. Frontend Deployment

### 2.1 Update API Configuration

Before deploying, make sure to update the API URL in the frontend configuration to point to your deployed backend:

```javascript
// In src/config.js
const config = {
  development: {
    apiUrl: 'http://localhost:5001'
  },
  production: {
    apiUrl: 'https://your-backend-url.onrender.com' // Replace with your actual backend URL
  }
};
```

### 2.2 Deploy to Netlify

1. Sign up for a [Netlify](https://www.netlify.com/) account
2. Click "New site from Git"
3. Connect to your GitHub repository
4. Configure the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

5. Add the following environment variable:
   - `REACT_APP_API_URL`: Your backend API URL

6. Click "Deploy site"

### 2.3 Alternative: Deploy to Vercel

1. Sign up for a [Vercel](https://vercel.com/) account
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. Add the environment variable:
   - `REACT_APP_API_URL`: Your backend API URL

5. Click "Deploy"

## 3. Mobile App Deployment

### 3.1 Update API Configuration

Before building the mobile app, update the API URL in the mobile app configuration:

```javascript
// In src/config.js
const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.3:5001', // Local development IP
  },
  prod: {
    apiUrl: 'https://your-backend-url.onrender.com', // Replace with your actual backend URL
  }
};
```

### 3.2 Build with Expo

#### 3.2.1 Set Up Expo Account

1. Sign up for an [Expo](https://expo.dev/) account
2. Install the Expo CLI: `npm install -g expo-cli`
3. Log in to your Expo account: `expo login`

#### 3.2.2 Configure app.json

Update your `app.json` file with the necessary information:

```json
{
  "expo": {
    "name": "Expense Tracker",
    "slug": "expense-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.expensetracker"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.expensetracker"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

#### 3.2.3 Build for Android

```bash
expo build:android -t apk
# or for app bundle
expo build:android -t app-bundle
```

#### 3.2.4 Build for iOS

```bash
expo build:ios -t archive
# or for simulator
expo build:ios -t simulator
```

### 3.3 Publish to App Stores

#### 3.3.1 Google Play Store

1. Create a [Google Play Developer account](https://play.google.com/console/signup) ($25 one-time fee)
2. Create a new application
3. Fill in the store listing details
4. Upload your APK or App Bundle
5. Set up pricing and distribution
6. Submit for review

#### 3.3.2 Apple App Store

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Create a new application in App Store Connect
3. Fill in the app information
4. Upload your build using Xcode or Transporter
5. Submit for review

## 4. Continuous Deployment

### 4.1 Backend CI/CD with GitHub Actions

Create a `.github/workflows/backend-deploy.yml` file:

```yaml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### 4.2 Frontend CI/CD with Netlify

Netlify automatically deploys when changes are pushed to your repository. You can also set up a custom GitHub Actions workflow if needed.

## 5. Post-Deployment Tasks

### 5.1 Test All Components

1. Test the backend API endpoints
2. Test the web frontend functionality
3. Test the mobile app on different devices

### 5.2 Set Up Monitoring

1. Set up [Sentry](https://sentry.io/) for error tracking
2. Configure [LogRocket](https://logrocket.com/) for session replay
3. Implement [Google Analytics](https://analytics.google.com/) for usage tracking

### 5.3 Regular Maintenance

1. Keep dependencies updated
2. Monitor server logs
3. Back up your database regularly

## Conclusion

Your Expense Tracker application is now fully deployed and accessible to users worldwide. The web version is available at your Netlify URL, and the mobile app can be downloaded from the app stores.

For any issues or questions, refer to the documentation of the respective deployment platforms or reach out to their support teams.
