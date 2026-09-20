import { useState, useEffect } from 'react'
import AttendanceMain from './AttendanceMain'
import AdminLogin from '../admin/AdminLogin'
import AdminPanel from '../admin/AdminPanel'
import DanceEvaluation from '../dance/DanceEvaluation'
import DanceReflection from '../dance/DanceReflection'
import TeacherCommentManagement from '../teacher/TeacherCommentManagement'
import SportsFestival from '../sports-festival/SportsFestival'
import { listenAttendanceData } from '../../firestore-utils'
import './PEToolsMain.css'

const PETOOLS_MENUS = [
  { id: 'attendance', name: '학교스포츠클럽 출석' },
  { id: 'sports-festival', name: '🎉 체육한마당' },
  { id: 'dance', name: '댄스 평가' },
  { id: 'reflection', name: '댄스 소감문' },
  { id: 'comment', name: '교과세특' }
]

function PEToolsMain({ students, setStudents }) {
  const [activeMenu, setActiveMenu] = useState('')
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [attendance, setAttendance] = useState({})

  useEffect(() => {
    let unsubscribe = () => {}
    listenAttendanceData('class1', (data) => {
      setAttendance(data)
    }).then(unsub => {
      unsubscribe = unsub
    })
    return () => unsubscribe()
  }, [])

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
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setActiveMenu('admin')}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '10px 16px',
                background: '#232f52',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                zIndex: '10'
              }}
            >
              🔐 관리자
            </button>
            <AttendanceMain
              students={students}
              attendance={attendance}
              setAttendance={setAttendance}
              classId="class1"
            />
          </div>
        )}

        {activeMenu === 'sports-festival' && (
          <SportsFestival />
        )}

        {activeMenu === 'dance' && (
          <DanceEvaluation />
        )}

        {activeMenu === 'reflection' && (
          <DanceReflection />
        )}

        {activeMenu === 'comment' && (
          <TeacherCommentManagement />
        )}

        {activeMenu === 'admin' && (
          <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
        )}
      </div>
    </div>
  )
}

export default PEToolsMain
