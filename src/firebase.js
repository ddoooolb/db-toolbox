import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, remove, onValue } from 'firebase/database'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const auth = getAuth(app)

console.log('Firebase Realtime Database 초기화:', {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL
})

export const initializeAuth = async () => {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth)
      console.log('✓ Firebase 익명 로그인 성공')
    }
  } catch (error) {
    console.error('✗ Firebase 인증 실패:', error)
  }
}
