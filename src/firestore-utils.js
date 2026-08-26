import { db, auth } from './firebase'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'

const waitForAuth = async (maxRetries = 50) => {
  for (let i = 0; i < maxRetries; i++) {
    if (auth.currentUser) return auth.currentUser
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('인증 타임아웃')
}

export const getAttendanceData = async (classId) => {
  try {
    await waitForAuth()
    const classDoc = doc(db, 'classes', classId, 'data', 'attendance')
    const snap = await getDoc(classDoc)
    return snap.data() || {}
  } catch (error) {
    console.error('출석 데이터 로드 실패:', error)
    return {}
  }
}

export const setAttendanceData = async (classId, data) => {
  try {
    await waitForAuth()
    const classDoc = doc(db, 'classes', classId, 'data', 'attendance')
    await setDoc(classDoc, data, { merge: true })
  } catch (error) {
    console.error('출석 데이터 저장 실패:', error)
  }
}

export const listenAttendanceData = (classId, onUpdate) => {
  const classDoc = doc(db, 'classes', classId, 'data', 'attendance')
  return onSnapshot(classDoc, (snapshot) => {
    onUpdate(snapshot.data() || {})
  }, (error) => {
    console.error('실시간 리스닝 실패:', error)
  })
}
