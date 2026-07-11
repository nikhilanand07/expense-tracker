// API URL: always prefer the env var, fall back to localhost for local development
const apiUrl = process.env.REACT_APP_API_URL || 'https://expense-tracker-backend-zqt0.onrender.com';

const config = { apiUrl };

export default config;
