# Expense Tracker Setup Instructions

## Prerequisites
- Node.js (v14 or later)
- npm (comes with Node.js)
- MongoDB (local installation or MongoDB Atlas)

## Backend Setup

1. Navigate to the backend directory:
   ```
   cd /Users/nikhilanand/CascadeProjects/expense-tracker/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create or update the `.env` file with the following content:
   ```
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

4. Start the backend server:
   ```
   npm start
   ```
   
   The server should start on port 5001 with the message:
   ```
   Connected to MongoDB
   Server running on port 5001
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd /Users/nikhilanand/CascadeProjects/expense-tracker/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Make sure the proxy in `package.json` points to the backend server:
   ```json
   "proxy": "http://localhost:5001"
   ```

4. Start the frontend development server:
   ```
   npm start
   ```
   
   This should open the application in your default browser at http://localhost:3000

## Troubleshooting

### Port Already in Use
If you see an error like `EADDRINUSE: address already in use`, you can:

1. Find the process using the port:
   ```
   lsof -i :<port_number>
   ```

2. Kill the process:
   ```
   kill -9 <PID>
   ```

3. Or change the port in the `.env` file (for backend) or by using:
   ```
   PORT=3001 npm start
   ```
   (for frontend)

### MongoDB Connection Issues
If MongoDB fails to connect:

1. Make sure MongoDB is installed and running:
   ```
   brew services list  # On macOS with Homebrew
   ```

2. Start MongoDB if it's not running:
   ```
   brew services start mongodb-community  # On macOS with Homebrew
   ```

3. Or use MongoDB Atlas by updating the MONGO_URI in the `.env` file.

### Node.js/npm Not Found
If you get "command not found" errors for Node.js or npm:

1. Install Node.js from https://nodejs.org/

2. Or use a version manager like nvm:
   ```
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   nvm install node
   ```

## Application Structure

- Backend API runs on: http://localhost:5001
- Frontend runs on: http://localhost:3000

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
