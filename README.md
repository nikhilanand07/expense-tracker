# Expense Tracker Application

A full-stack expense tracking application built with Node.js, React, and MongoDB.

## Features

- User authentication (signup/login)
- Add, update, and delete expenses
- Filter expenses by date range, category, and payment method
- Responsive design for all devices

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Frontend
- React.js
- React Bootstrap
- React Router
- Formik & Yup for form validation
- Axios for API requests

## Project Structure

```
expense-tracker/
├── backend/               # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Entry point
│
├── frontend/              # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source files
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── App.js         # Main component
│   │   └── index.js       # Entry point
│   └── package.json       # Frontend dependencies
│
└── README.md              # Project documentation
```

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Set up the backend

```bash
cd backend
npm install

# Create a .env file with the following variables
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/expense-tracker
# JWT_SECRET=your_jwt_secret_key_here
# JWT_EXPIRE=30d

# Start the server
npm start
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm start
```

The application should now be running with:
- Backend API on http://localhost:5000
- Frontend on http://localhost:3000

## API Endpoints

### User Routes
- `POST /api/users/signup` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get current user profile (protected)

### Expense Routes (all protected)
- `GET /api/expenses` - Get all expenses for the logged-in user
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/:id` - Get a specific expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

## License

This project is licensed under the MIT License.
