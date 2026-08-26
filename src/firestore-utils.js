import { db, auth } from './firebase'
import { doc, getDoc, setDoc, onSnapshot, deleteField } from 'firebase/firestore'

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
    const updateData = {}
    Object.entries(data).forEach(([key, value]) => {
      if (value && value > 0) {
        updateData[key] = value
      } else {
        updateData[key] = deleteField()
      }
    })
    await setDoc(classDoc, updateData, { merge: true })
    console.log('✓ 출석 데이터 저장 성공')
  } catch (error) {
    console.error('✗ 출석 데이터 저장 실패:', error.code, error.message)
  }
}

export const listenAttendanceData = async (classId, onUpdate) => {
  await waitForAuth()
  const classDoc = doc(db, 'classes', classId, 'data', 'attendance')
  try {
    return onSnapshot(classDoc, (snapshot) => {
      onUpdate(snapshot.data() || {})
    }, (error) => {
      console.error('실시간 리스닝 실패:', error)
    })
  } catch (error) {
    console.error('리스너 설정 실패:', error)
    return () => {}
  }
}
