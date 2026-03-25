const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// Remove this as we're already loading environment variables in start-server.js
// require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const groupRoutes = require('./routes/groupRoutes');
const billRoutes = require('./routes/billRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS middleware - apply before any route definitions
app.use(cors({
  origin: true, // Automatically reflect the request origin
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/bills', billRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to Expense Tracker API');
});

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: NODE_ENV });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Server Error' : err.message,
    stack: NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Listen on all network interfaces (0.0.0.0) to allow external connections
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      
      if (NODE_ENV === 'development') {
        console.log(`Server is accessible at http://localhost:${PORT}`);
        console.log(`For mobile devices, use http://192.168.1.3:${PORT}`);
      }
    });
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit with failure code
  });
