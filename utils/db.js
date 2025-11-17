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

// Whether Firestore is available for use
const useFirestore = !!db

// Helper: get collection reference
function getCollectionRef(name) {
  if (!useFirestore) throw new Error('Firestore not initialized')
  return db.collection(name)
}

// Helper: get a single document by id
async function getDoc(collection, id) {
  if (!useFirestore) throw new Error('Firestore not initialized')
  const snap = await db.collection(collection).doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() }
}

// Helper: set/create/update a document
async function setDoc(collection, id, data) {
  if (!useFirestore) throw new Error('Firestore not initialized')
  await db.collection(collection).doc(id).set(data)
  return { id, ...data }
}

// Helper: delete a document
async function deleteDoc(collection, id) {
  if (!useFirestore) throw new Error('Firestore not initialized')
  await db.collection(collection).doc(id).delete()
}

// Helper: query documents where a field is in a list (handles Firestore 10-item 'in' limit)
async function queryByFieldIn(collection, field, values) {
  if (!useFirestore) throw new Error('Firestore not initialized')
  if (!Array.isArray(values) || values.length === 0) return []
  const chunkSize = 10
  const results = []
  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize)
    const snap = await db.collection(collection).where(field, 'in', chunk).get()
    snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }))
  }
  return results
}

module.exports = { admin, db, useFirestore, getCollectionRef, getDoc, setDoc, deleteDoc, queryByFieldIn }
