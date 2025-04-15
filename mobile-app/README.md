# Expense Tracker Mobile App

This is the React Native mobile application for the Expense Tracker project. It shares the same backend API as the web version but provides a native mobile experience.

## Features

- User authentication (login, signup, logout)
- Currency selection
- Add, edit, and delete expenses
- Filter expenses by date range, category, and payment method
- View expense insights with charts and graphs
- Dark mode support
- Offline capabilities with data syncing

## Tech Stack

- React Native
- Expo
- React Navigation
- Async Storage for local data persistence
- Victory Native for charts
- Axios for API requests
- React Native Paper for UI components

## Project Structure

```
mobile-app/
├── assets/             # Images, fonts, and other static assets
├── src/
│   ├── api/            # API service functions
│   ├── components/     # Reusable UI components
│   ├── context/        # Context providers (Auth, Theme)
│   ├── hooks/          # Custom hooks
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # App screens
│   ├── utils/          # Utility functions
│   └── App.js          # Main app component
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
└── package.json        # Dependencies and scripts
```

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npx expo start
   ```

3. Run on iOS or Android:
   ```
   npx expo run:ios
   npx expo run:android
   ```

## Backend API Integration

The mobile app connects to the same backend API as the web version. Make sure the backend server is running and accessible from your mobile device or emulator.

Update the API base URL in `src/api/client.js` to point to your backend server.

## Development Roadmap

1. Setup project and dependencies
2. Implement authentication screens and logic
3. Create main expense listing and filtering
4. Develop expense creation and editing functionality
5. Implement insights and charts
6. Add currency selection and dark mode
7. Optimize for performance and offline use
8. Test on multiple devices and platforms
9. Deploy to app stores

## Contributing

Please follow the project's coding standards and submit pull requests for any new features or bug fixes.
