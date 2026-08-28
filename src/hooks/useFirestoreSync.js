import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Firestore와 localStorage를 양방향 동기화하는 커스텀 훅
 * @param {string} collectionName - Firestore 컬렉션 이름
 * @param {string} localStorageKey - localStorage 저장 키
 * @param {object} defaultData - 기본값 (Firestore에 데이터가 없을 때)
 * @returns {object} { data, setData, loading }
 */
export const useFirestoreSync = (collectionName, localStorageKey, defaultData = {}) => {
  const [data, setData] = useState(() => {
    // 초기값: localStorage에서 읽기
    const stored = localStorage.getItem(localStorageKey)
    return stored ? JSON.parse(stored) : defaultData
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Firestore에서 실시간 동기화
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      snapshot => {
        const firestoreData = {}
        snapshot.forEach(doc => {
          firestoreData[doc.id] = doc.data()
        })

        // Firestore 데이터가 있으면 사용, 없으면 기본값 사용
        const syncedData = Object.keys(firestoreData).length > 0 ? firestoreData : defaultData

        setData(syncedData)
        localStorage.setItem(localStorageKey, JSON.stringify(syncedData))
        setLoading(false)
      },
      error => {
        console.error(`Firestore 동기화 오류 (${collectionName}):`, error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [collectionName, localStorageKey])

  return { data, setData, loading }
}
