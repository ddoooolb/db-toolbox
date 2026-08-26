import { db, auth } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const waitForAuth = async (maxRetries = 50) => {
  for (let i = 0; i < maxRetries; i++) {
    if (auth.currentUser) return auth.currentUser
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('인증 타임아웃')
}

export const getAttendanceData = async () => {
  try {
    await waitForAuth()
    const userId = auth.currentUser.uid
    const userDoc = doc(db, 'users', userId)
    const attendanceDoc = doc(userDoc, 'data', 'attendance')
    const snap = await getDoc(attendanceDoc)
    return snap.data() || {}
  } catch (error) {
    console.error('출석 데이터 로드 실패:', error)
    return {}
  }
}

export const setAttendanceData = async (data) => {
  try {
    await waitForAuth()
    const userId = auth.currentUser.uid
    const userDoc = doc(db, 'users', userId)
    const attendanceDoc = doc(userDoc, 'data', 'attendance')
    await setDoc(attendanceDoc, data, { merge: true })
  } catch (error) {
    console.error('출석 데이터 저장 실패:', error)
  }
}
