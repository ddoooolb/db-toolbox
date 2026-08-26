import { db, auth } from './firebase'
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'

const getUserDoc = () => {
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('인증되지 않음')
  return doc(db, 'users', userId)
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
    const userDoc = getUserDoc()
    const pathParts = parentPath.split('/')
    const parentRef = doc(userDoc, ...pathParts)
    const childRef = doc(parentRef, ...childPath.split('/'))
    const snap = await getDoc(childRef)
    return snap.data() || {}
  } catch (error) {
    console.error('중첩 데이터 읽기 실패:', error)
    return {}
  }
}

export const setNestedFirestoreData = async (parentPath, childPath, data) => {
  try {
    const userDoc = getUserDoc()
    const pathParts = parentPath.split('/')
    const parentRef = doc(userDoc, ...pathParts)
    const childRef = doc(parentRef, ...childPath.split('/'))
    await setDoc(childRef, data, { merge: true })
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
