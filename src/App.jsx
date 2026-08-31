import { useState, useEffect } from 'react'
import PEToolsMain from './components/attendance/PEToolsMain'
import AttendancePublic from './components/attendance/AttendancePublic'
import DanceEvaluation from './components/dance/DanceEvaluation'
import { initialStudents } from './data/students'
import { initialGroupsData } from './data/groupsData'
import { initializeAuth, db } from './firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import './App.css'

function App() {
  const [students, setStudents] = useState(initialStudents)

  useEffect(() => {
    initializeAuth()

    // Firestore에서 groupsData 실시간 동기화
    const unsubscribeGroups = onSnapshot(collection(db, 'groups'), snapshot => {
      const firestoreGroups = {}
      snapshot.forEach(doc => {
        firestoreGroups[doc.id] = doc.data()
      })
      if (Object.keys(firestoreGroups).length > 0) {
        localStorage.setItem('groups-data', JSON.stringify(firestoreGroups))
      } else {
        const existing = JSON.parse(localStorage.getItem('groups-data') || '{}')
        const merged = { ...existing, ...initialGroupsData }
        localStorage.setItem('groups-data', JSON.stringify(merged))
      }
    })

    // Firestore에서 students 데이터 실시간 동기화
    const unsubscribeStudents = onSnapshot(collection(db, 'students'), snapshot => {
      const firestoreStudents = []
      snapshot.forEach(doc => {
        firestoreStudents.push(doc.data())
      })

      // localStorage의 기존 데이터도 함께 로드
      const localStudents = JSON.parse(localStorage.getItem('students-data') || '[]')

      // 기본 데이터 + localStorage + Firestore를 모두 합침
      const allStudents = [...initialStudents, ...localStudents, ...firestoreStudents]
      const uniqueStudents = Array.from(
        new Map(allStudents.map(s => [s.id, s])).values()
      )

      setStudents(uniqueStudents)
      localStorage.setItem('students-data', JSON.stringify(uniqueStudents))
    })

    return () => {
      unsubscribeGroups()
      unsubscribeStudents()
    }
  }, [])

  const searchParams = new URLSearchParams(window.location.search)
  const attendanceMode = searchParams.get('mode') === 'attendance'
  const danceMode = searchParams.get('mode') === 'dance'

  const [activeTab, setActiveTab] = useState('petools')

  // 출석 전용 모드
  if (attendanceMode) {
    return <AttendancePublic students={initialStudents} />
  }

  // 댄스 평가 모드
  if (danceMode) {
    return <DanceEvaluation />
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>DB Toolbox</h1>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'dbtools' ? 'active' : ''}`}
          onClick={() => setActiveTab('dbtools')}
        >
          DBTools (개인 취미)
        </button>
        <button
          className={`tab ${activeTab === 'petools' ? 'active' : ''}`}
          onClick={() => setActiveTab('petools')}
        >
          PETools (학교 업무)
        </button>
      </nav>

      <main>
        {activeTab === 'dbtools' && (
          <section className="content">
            <h2>DBTools</h2>
            <p>개인 취미용 도구</p>
            <p>여기에 기능을 추가하세요</p>
          </section>
        )}

        {activeTab === 'petools' && (
          <PEToolsMain students={students} setStudents={setStudents} />
        )}
      </main>
    </div>
  )
}

export default App
