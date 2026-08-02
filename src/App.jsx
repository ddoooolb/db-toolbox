import { useState } from 'react'
import PEToolsMain from './components/attendance/PEToolsMain'
import AttendancePublic from './components/attendance/AttendancePublic'
import { initialStudents } from './data/students'
import './App.css'

function App() {
  const searchParams = new URLSearchParams(window.location.search)
  const attendanceMode = searchParams.get('mode') === 'attendance'

  const [activeTab, setActiveTab] = useState('petools')
  const [students, setStudents] = useState(initialStudents)

  // 출석 전용 모드
  if (attendanceMode) {
    return <AttendancePublic students={initialStudents} />
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
