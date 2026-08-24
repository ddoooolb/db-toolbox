import { useState } from 'react'
import AttendanceMain from './AttendanceMain'
import AdminLogin from '../admin/AdminLogin'
import AdminPanel from '../admin/AdminPanel'
import DanceEvaluation from '../dance/DanceEvaluation'
import './PEToolsMain.css'

const PETOOLS_MENUS = [
  { id: 'attendance', name: '학교스포츠클럽 출석' },
  { id: 'dance', name: '댄스 평가' }
]

function PEToolsMain({ students, setStudents }) {
  const [activeMenu, setActiveMenu] = useState('')
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [attendance, setAttendance] = useState({})

  if (isAdminLoggedIn) {
    return (
      <AdminPanel
        students={students}
        setStudents={setStudents}
        attendance={attendance}
        onLogout={() => {
          setIsAdminLoggedIn(false)
          setActiveMenu('')
        }}
      />
    )
  }

  return (
    <div className="petools-main">
      <div className="petools-menu">
        {PETOOLS_MENUS.map(menu => (
          <button
            key={menu.id}
            className={`menu-item ${activeMenu === menu.id ? 'active' : ''}`}
            onClick={() => setActiveMenu(menu.id)}
          >
            {menu.name}
          </button>
        ))}
      </div>

      <div className="petools-content">
        {activeMenu === 'attendance' && (
          <>
            <div className="attendance-header-actions">
              <button
                className="admin-link-button"
                onClick={() => setActiveMenu('admin')}
              >
                관리자
              </button>
            </div>
            <AttendanceMain
              students={students}
              attendance={attendance}
              setAttendance={setAttendance}
            />
          </>
        )}

        {activeMenu === 'dance' && (
          <DanceEvaluation />
        )}

        {activeMenu === 'admin' && (
          <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
        )}
      </div>
    </div>
  )
}

export default PEToolsMain
