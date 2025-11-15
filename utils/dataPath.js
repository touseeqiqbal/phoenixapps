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
  if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
    // Ensure /tmp/data exists
    const tmpDataDir = '/tmp/data';
    try {
      if (!fs.existsSync(tmpDataDir)) {
        fs.mkdirSync(tmpDataDir, { recursive: true });
      }
      dataDir = tmpDataDir;
      console.log('Using /tmp/data for data storage (Vercel environment)');
      return dataDir;
    } catch (error) {
      console.error('Could not create /tmp/data directory:', error);
      // Fallback to /tmp if /tmp/data fails
      dataDir = '/tmp';
      return dataDir;
    }
  }
  // Local development - use project data directory
  const localDataDir = path.join(__dirname, "../data");
  // Ensure local data directory exists
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
  } catch (error) {
    console.warn('Could not create local data directory:', error);
  }
  dataDir = localDataDir;
  return dataDir;
}

// Get path for a specific data file
function getDataFilePath(filename) {
  return path.join(getDataDir(), filename);
}

module.exports = {
  getDataDir,
  getDataFilePath
};
