require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // JSON parsing
app.use(express.urlencoded({ extended: true })); // URL-encoded body parsing
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Request logging middleware (simple version)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ROUTES
// API routes
app.use('/api', apiRoutes);

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ERROR HANDLING
// 404 handler - after all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.url
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// App startup
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('='.repeat(50));
  
  // Validation check for API key
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.warn(' WARNING: Google API key not configured!');
    console.warn(' Please set GOOGLE_PLACES_API_KEY in your .env file');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;