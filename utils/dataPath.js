const path = require("path");
const fs = require("fs");

// In Vercel serverless functions, the filesystem is read-only except for /tmp
// Use /tmp for data storage in Vercel, otherwise use the data directory
let dataDir = null;

function getDataDir() {
  if (dataDir) {
    return dataDir;
  }

  // Check if we're in Vercel environment
  // Vercel sets VERCEL=1 or VERCEL_ENV environment variables
  const isVercel = process.env.VERCEL === '1' || 
                   process.env.VERCEL_ENV || 
                   process.env.VERCEL_URL ||
                   process.env.AWS_LAMBDA_FUNCTION_NAME; // Also check for Lambda (Vercel uses Lambda)

  if (isVercel) {
    // Ensure /tmp/data exists
    const tmpDataDir = '/tmp/data';
    try {
      if (!fs.existsSync(tmpDataDir)) {
        fs.mkdirSync(tmpDataDir, { recursive: true });
        console.log('Created /tmp/data directory');
      }
      dataDir = tmpDataDir;
      console.log('Using /tmp/data for data storage (Vercel environment detected)');
      console.log('VERCEL env vars:', {
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL
      });
      return dataDir;
    } catch (error) {
      console.error('Could not create /tmp/data directory:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        errno: error.errno
      });
      // Fallback to /tmp if /tmp/data fails
      dataDir = '/tmp';
      console.log('Falling back to /tmp directory');
      return dataDir;
    }
  }
  // Local development - use project data directory
  const localDataDir = path.join(__dirname, "../data");
  // Ensure local data directory exists
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
      console.log('Created local data directory:', localDataDir);
    }
  } catch (error) {
    console.warn('Could not create local data directory:', error);
  }
  dataDir = localDataDir;
  console.log('Using local data directory:', dataDir);
  return dataDir;
}

// Get path for a specific data file
function getDataFilePath(filename) {
  const filePath = path.join(getDataDir(), filename);
  // Only log on first call to avoid spam
  if (!getDataFilePath._logged) {
    console.log('Data file path utility initialized, example path:', filePath);
    getDataFilePath._logged = true;
  }
  return filePath;
}

module.exports = {
  getDataDir,
  getDataFilePath
};
