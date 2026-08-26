import { useState } from 'react'
import AttendanceMain from './AttendanceMain'
import AdminLogin from '../admin/AdminLogin'
import AdminPanel from '../admin/AdminPanel'
import { initialStudents } from '../../data/students'
import './AttendancePublic.css'

function AttendancePublic({ students }) {
  const [attendance, setAttendance] = useState({})
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  if (isAdminLoggedIn) {
    return (
      <AdminPanel
        students={initialStudents}
        setStudents={() => {}}
        attendance={attendance}
        onLogout={() => {
          setIsAdminLoggedIn(false)
          setShowAdminLogin(false)
        }}
      />
    )
  }

  if (showAdminLogin) {
    return (
      <div className="attendance-public">
        <header className="public-header">
          <h1>학교스포츠클럽 출석</h1>
          <p className="subtitle">태블릿 전용 출석 페이지</p>
        </header>
        <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
      </div>
    )
  }

  return (
    <div className="attendance-public">
      <header className="public-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1>학교스포츠클럽 출석</h1>
            <p className="subtitle">태블릿 전용 출석 페이지</p>
          </div>
          <button
            onClick={() => setShowAdminLogin(true)}
            style={{
              padding: '10px 16px',
              background: '#232f52',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            🔐 관리자
          </button>
        </div>
      </header>

      <main className="public-content">
        <AttendanceMain
          students={students}
          attendance={attendance}
          setAttendance={setAttendance}
        />
      </main>

      <footer className="public-footer">
        <p>관리자는 우측 상단의 🔐 관리자 버튼을 클릭하세요</p>
      </footer>
    </div>
  )
}

export default AttendancePublic
