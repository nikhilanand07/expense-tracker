const { exec } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables based on NODE_ENV
const environment = process.env.NODE_ENV || 'development';
console.log(`Starting server in ${environment} mode`);

// Load the appropriate .env file
if (environment === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '.env.production') });
} else {
  dotenv.config();
}

const PORT = process.env.PORT || 5001;

// Function to check if port is in use and kill the process
const checkPortAndStart = () => {
  // Skip port checking in production environment
  if (environment === 'production') {
    console.log(`Running in production mode. Starting server on port ${PORT}...`);
    startServer();
    return;
  }

  console.log(`Checking if port ${PORT} is in use...`);
  
  // For macOS and Linux
  const command = `lsof -i :${PORT} -t`;
  
  exec(command, (error, stdout, stderr) => {
    if (stdout) {
      const pid = stdout.trim();
      console.log(`Port ${PORT} is in use by process ${pid}. Killing process...`);
      
      // Kill the process
      exec(`kill -9 ${pid}`, (killError) => {
        if (killError) {
          console.error(`Failed to kill process: ${killError.message}`);
          process.exit(1);
        }
        
        console.log(`Process ${pid} killed. Starting server...`);
        startServer();
      });
    } else {
      console.log(`Port ${PORT} is available. Starting server...`);
      startServer();
    }
  });
};

// Function to start the server
const startServer = () => {
  // Import server.js and start the application
  require('./server');
};

// Run the check and start process
checkPortAndStart();
