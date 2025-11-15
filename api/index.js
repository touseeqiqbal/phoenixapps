// Vercel serverless function entry point
// This wraps the Express app for Vercel deployment
const app = require('../server');

// Export the app for Vercel serverless functions
module.exports = app;
