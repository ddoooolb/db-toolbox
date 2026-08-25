import { useState } from 'react'
import * as XLSX from 'xlsx'
import StudentManagement from './StudentManagement'
import AttendanceStatistics from '../attendance/AttendanceStatistics'
import './AdminPanel.css'

function AdminPanel({ students, setStudents, attendance, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('students')

  const handleExportExcel = () => {
    if (students.length === 0) {
      alert('내보낼 학생 데이터가 없습니다')
      return
    }

    // 종목별로 데이터 그룹화
    const sportGroups = {}
    students.forEach(student => {
      if (!sportGroups[student.sports]) {
        sportGroups[student.sports] = []
      }
      sportGroups[student.sports].push(student)
    })

    // 엑셀 워크북 생성
    const workbook = XLSX.utils.book_new()

    // 각 종목별로 시트 추가
    Object.keys(sportGroups).forEach(sport => {
      const sportStudents = sportGroups[sport]
        .sort((a, b) => {
          if (a.grade !== b.grade) return parseInt(a.grade) - parseInt(b.grade)
          if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class)
          return parseInt(a.number) - parseInt(b.number)
        })

      // 학생별로 모든 날짜의 활동 시간 계산
      const data = sportStudents.map(student => {
        const record = {
          학년: student.grade,
          반: student.class,
          번호: student.number,
          이름: student.name,
          종목: student.sports
        }

        // 모든 날짜의 활동 시간 합산
        let totalMinutes = 0
        Object.keys(attendance || {}).forEach(key => {
          const [date, recordSport, studentId] = key.split('-').slice(0, 3)
          if (recordSport === sport && studentId === student.id) {
            const minutes = attendance[key]
            if (minutes && parseFloat(minutes) > 0) {
              totalMinutes += parseFloat(minutes)
            }
          }
        })

        record['활동시간(분)'] = totalMinutes
        record['활동시간(시간)'] = (totalMinutes / 60).toFixed(2)

        return record
      })

      const worksheet = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, sport)
    })

    // 파일 다운로드
    const today = new Date().toISOString().split('T')[0]
    XLSX.writeFile(workbook, `학교스포츠클럽_출석_${today}.xlsx`)
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>관리자 페이지</h1>
        <button className="logout-btn" onClick={onLogout}>
          로그아웃
        </button>
      </header>

      <div className="admin-container">
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeMenu === 'students' ? 'active' : ''}`}
            onClick={() => setActiveMenu('students')}
          >
            학생 관리
          </button>
          <button
            className={`nav-item ${activeMenu === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveMenu('statistics')}
          >
            통계
          </button>
          <button
            className={`nav-item ${activeMenu === 'export' ? 'active' : ''}`}
            onClick={() => setActiveMenu('export')}
          >
            엑셀 내보내기
          </button>
        </nav>

        <main className="admin-content">
          {activeMenu === 'students' && (
            <StudentManagement students={students} setStudents={setStudents} />
          )}
          {activeMenu === 'statistics' && (
            <AttendanceStatistics students={students} attendance={attendance || {}} />
          )}
          {activeMenu === 'export' && (
            <div className="menu-section">
              <h2>엑셀 내보내기</h2>
              <p>종목별로 정렬된 학생 명단을 엑셀 파일로 다운로드합니다.</p>
              <button className="btn-primary" onClick={handleExportExcel}>
                📊 엑셀로 내보내기
              </button>
              <p className="info-text">
                현재 {students.length}명의 학생 데이터가 있습니다.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminPanel
