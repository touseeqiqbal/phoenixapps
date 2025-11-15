const admin = require("firebase-admin");

// Initialize Firebase Admin if available
let firebaseInitialized = false;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
  } else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp();
    firebaseInitialized = true;
  }
} catch (error) {
  console.warn("Firebase Admin not initialized in middleware. Using fallback.");
}

exports.authRequired = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Try Firebase token verification first
    if (firebaseInitialized) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
          id: decodedToken.uid,
          uid: decodedToken.uid,
          email: decodedToken.email
        };
        return next();
      } catch (firebaseError) {
        // If Firebase verification fails, try JWT fallback
        console.warn("Firebase token verification failed, trying JWT fallback");
      }
    }

    // Fallback to JWT (for backward compatibility)
    const jwt = require("jsonwebtoken");
    const config = require("../config");
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
