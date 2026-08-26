import { useState, useEffect } from 'react'
import AttendanceMain from './AttendanceMain'
import AdminLogin from '../admin/AdminLogin'
import AdminPanel from '../admin/AdminPanel'
import DanceEvaluation from '../dance/DanceEvaluation'
import { getNestedFirestoreData, setNestedFirestoreData } from '../../firestore-utils'
import './PEToolsMain.css'

const PETOOLS_MENUS = [
  { id: 'attendance', name: '학교스포츠클럽 출석' },
  { id: 'dance', name: '댄스 평가' }
]

function PEToolsMain({ students, setStudents }) {
  const [activeMenu, setActiveMenu] = useState('')
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)

  // Firestore에서 출석 데이터 로드
  useEffect(() => {
    const loadAttendance = async () => {
      const data = await getNestedFirestoreData('data', 'attendance')
      setAttendance(data || {})
      setLoading(false)
    }
    loadAttendance()
  }, [])

  // 출석 데이터 변경 시 Firestore에 저장
  useEffect(() => {
    if (!loading) {
      setNestedFirestoreData('data', 'attendance', attendance)
    }
  }, [attendance, loading])

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
            <AttendanceMain
              students={students}
              attendance={attendance}
              setAttendance={setAttendance}
            />
            <div className="attendance-header-actions" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '100' }}>
              <button
                className="admin-link-button"
                onClick={() => setActiveMenu('admin')}
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
