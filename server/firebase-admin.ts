import { initializeApp, cert, getApps, App } from "firebase-admin/app"
import { getFirestore, Firestore } from "firebase-admin/firestore"

let adminApp: App
let db: Firestore

// Initialize Firebase Admin
export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // For production, use service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      })
    } else {
      console.warn(" Firebase Admin not initialized - missing service account credentials")
      console.warn(" Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable for production")
      adminApp = initializeApp()
    }
  } else {
    adminApp = getApps()[0]
  }

  db = getFirestore(adminApp)
  return db
}

export function getAdminDb(): Firestore {
  if (!db) {
    return initializeFirebaseAdmin()
  }
  return db
}
