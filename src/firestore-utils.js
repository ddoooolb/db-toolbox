import { db, auth } from './firebase'
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'

const getUserDoc = () => {
  const userId = auth.currentUser?.uid
  if (!userId) {
    console.warn('대기 중: Firebase 인증 초기화')
    throw new Error('인증되지 않음')
  }
  return doc(db, 'users', userId)
}

const waitForAuth = async (maxRetries = 50) => {
  for (let i = 0; i < maxRetries; i++) {
    if (auth.currentUser) return auth.currentUser
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('인증 타임아웃')
}

export const getFirestoreData = async (path) => {
  try {
    const userDoc = getUserDoc()
    const ref = doc(userDoc, ...path.split('/'))
    const snap = await getDoc(ref)
    return snap.data() || null
  } catch (error) {
    console.error('데이터 읽기 실패:', error)
    return null
  }
}

export const setFirestoreData = async (path, data) => {
  try {
    const userDoc = getUserDoc()
    const ref = doc(userDoc, ...path.split('/'))
    await setDoc(ref, data, { merge: true })
  } catch (error) {
    console.error('데이터 저장 실패:', error)
  }
}

export const updateFirestoreData = async (path, data) => {
  try {
    const userDoc = getUserDoc()
    const ref = doc(userDoc, ...path.split('/'))
    await updateDoc(ref, data)
  } catch (error) {
    console.error('데이터 업데이트 실패:', error)
  }
}

export const getNestedFirestoreData = async (parentPath, childPath) => {
  try {
    await waitForAuth()
    const userId = auth.currentUser.uid
    const fullPath = `users/${userId}/${parentPath}/${childPath}`
    const parts = fullPath.split('/')
    let ref = db
    for (let i = 0; i < parts.length; i += 2) {
      if (i + 1 < parts.length) {
        ref = i === 0 ? collection(db, parts[i]) : collection(ref, parts[i])
        ref = doc(ref, parts[i + 1])
      }
    }
    const snap = await getDoc(ref)
    return snap.data() || {}
  } catch (error) {
    console.error('중첩 데이터 읽기 실패:', error)
    return {}
  }
}

export const setNestedFirestoreData = async (parentPath, childPath, data) => {
  try {
    await waitForAuth()
    const userId = auth.currentUser.uid
    const fullPath = `users/${userId}/${parentPath}/${childPath}`
    const parts = fullPath.split('/')
    let ref = db
    for (let i = 0; i < parts.length; i += 2) {
      if (i + 1 < parts.length) {
        ref = i === 0 ? collection(db, parts[i]) : collection(ref, parts[i])
        ref = doc(ref, parts[i + 1])
      }
    }
    await setDoc(ref, data, { merge: true })
  } catch (error) {
    console.error('중첩 데이터 저장 실패:', error)
  }
}

// 댄스 평가용 편의 함수
export const getDanceData = async (dataType, selectedClass) => {
  try {
    const data = await getNestedFirestoreData('dance', `${selectedClass}/${dataType}`)
    return data || {}
  } catch (error) {
    console.error('댄스 데이터 로드 실패:', error)
    return {}
  }
}

export const setDanceData = async (dataType, selectedClass, data) => {
  try {
    await setNestedFirestoreData('dance', `${selectedClass}/${dataType}`, data)
  } catch (error) {
    console.error('댄스 데이터 저장 실패:', error)
  }
}
