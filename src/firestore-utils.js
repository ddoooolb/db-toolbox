import { db, auth } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

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
    const data = snap.data() || {}
    console.log('출석 데이터 로드:', classId, data)
    return data
  } catch (error) {
    console.error('출석 데이터 로드 실패:', error)
    return {}
  }
}

export const setAttendanceData = async (classId, data) => {
  try {
    await waitForAuth()
    console.log('출석 데이터 저장:', classId, data)
    const classDoc = doc(db, 'classes', classId, 'data', 'attendance')
    await setDoc(classDoc, data, { merge: true })
  } catch (error) {
    console.error('출석 데이터 저장 실패:', error)
  }
}
