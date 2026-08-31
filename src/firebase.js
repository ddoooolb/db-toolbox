import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app, '(default)')
export const auth = getAuth(app)

console.log('Firebase Firestore 초기화:', {
  projectId: firebaseConfig.projectId
})

enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs, persistence in one tab only')
  } else if (err.code === 'unimplemented') {
    console.log('Browser does not support persistence')
  }
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
