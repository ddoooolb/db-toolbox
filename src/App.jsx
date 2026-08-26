import { useState, useEffect } from 'react'
import PEToolsMain from './components/attendance/PEToolsMain'
import AttendancePublic from './components/attendance/AttendancePublic'
import DanceEvaluation from './components/dance/DanceEvaluation'
import { initialStudents } from './data/students'
import { initialGroupsData } from './data/groupsData'
import { initializeAuth } from './firebase'
import './App.css'

function App() {
  useEffect(() => {
    initializeAuth()
    const existing = JSON.parse(localStorage.getItem('groups-data') || '{}')
    const merged = { ...existing, ...initialGroupsData }
    localStorage.setItem('groups-data', JSON.stringify(merged))
  }, [])

  const searchParams = new URLSearchParams(window.location.search)
  const attendanceMode = searchParams.get('mode') === 'attendance'
  const danceMode = searchParams.get('mode') === 'dance'

  const [activeTab, setActiveTab] = useState('petools')
  const [students, setStudents] = useState(initialStudents)

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
