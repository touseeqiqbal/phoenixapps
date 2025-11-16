const admin = require('firebase-admin')

let app
try {
  if (!admin.apps || admin.apps.length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      app = admin.initializeApp({ credential: admin.credential.cert(creds) })
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Will use GOOGLE_APPLICATION_CREDENTIALS if available
      app = admin.initializeApp()
    }
  } else {
    app = admin.app()
  }
} catch (e) {
  console.warn('Firebase Admin init skipped or failed:', e && e.message ? e.message : e)
}

const db = admin.apps && admin.apps.length ? admin.firestore() : null

module.exports = { admin, db }
