import { useState, useEffect } from 'react'
import PEToolsMain from './components/attendance/PEToolsMain'
import AttendancePublic from './components/attendance/AttendancePublic'
import DanceEvaluation from './components/dance/DanceEvaluation'
import { initialStudents } from './data/students'
import { initialGroupsData } from './data/groupsData'
import { initializeAuth, database } from './firebase'
import { ref, onValue } from 'firebase/database'
import './App.css'

function App() {
  const [students, setStudents] = useState(initialStudents)

  useEffect(() => {
    initializeAuth()

    // Realtime Database에서 students 데이터 실시간 동기화
    const studentsRef = ref(database, 'students')
    const unsubscribeStudents = onValue(
      studentsRef,
      snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          const rtdbStudents = Array.isArray(data) ? data : Object.values(data)
          console.log('✓ students 동기화 성공:', rtdbStudents.length)
          setStudents(rtdbStudents)
          localStorage.setItem('students-data', JSON.stringify(rtdbStudents))
        } else {
          console.log('✓ students 데이터 없음, 초기 데이터 사용')
          setStudents(initialStudents)
          localStorage.setItem('students-data', JSON.stringify(initialStudents))
        }
      },
      error => {
        console.error('✗ students 동기화 오류:', error.message)
        const localData = JSON.parse(localStorage.getItem('students-data') || '[]')
        setStudents(localData.length > 0 ? localData : initialStudents)
      }
    )

    // Realtime Database에서 groups 데이터 초기화
    const groupsRef = ref(database, 'groups')
    const unsubscribeGroups = onValue(
      groupsRef,
      snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          console.log('✓ groups 동기화 성공')
          localStorage.setItem('groups-data', JSON.stringify(data))
        } else {
          console.log('✓ groups 데이터 없음, 초기 데이터 사용')
          localStorage.setItem('groups-data', JSON.stringify(initialGroupsData))
        }
      },
      error => {
        console.error('✗ groups 동기화 오류:', error.message)
      }
    )

    return () => {
      unsubscribeStudents()
      unsubscribeGroups()
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
