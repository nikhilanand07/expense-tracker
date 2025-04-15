// Configuration for different environments
const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.3:5001', // Local development IP
    enableDebug: true
  },
  staging: {
    apiUrl: 'https://your-backend-staging-url.onrender.com',
    enableDebug: true
  },
  prod: {
    apiUrl: 'https://your-backend-url.onrender.com',
    enableDebug: false
  }
};

// Get the current environment
const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
  if (env === 'development') {
    return ENV.dev;
  } else if (env === 'staging') {
    return ENV.staging;
  } else if (env === 'production') {
    return ENV.prod;
  }
};

export default getEnvVars();
