import { useState } from 'react'
import * as XLSX from 'xlsx'
import StudentManagement from './StudentManagement'
import AttendanceStatistics from '../attendance/AttendanceStatistics'
import './AdminPanel.css'

function AdminPanel({ students, setStudents, attendance, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('students')
  const [selectedSport, setSelectedSport] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleExportExcel = () => {
    if (!selectedSport) {
      alert('종목을 선택해주세요')
      return
    }
    if (!startDate || !endDate) {
      alert('날짜 범위를 선택해주세요')
      return
    }

    const sportStudents = students
      .filter(s => s.sports === selectedSport)
      .sort((a, b) => {
        if (a.grade !== b.grade) return parseInt(a.grade) - parseInt(b.grade)
        if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class)
        return parseInt(a.number) - parseInt(b.number)
      })

    const data = sportStudents.map(student => {
      const record = {
        학년: student.grade,
        반: student.class,
        번호: student.number,
        이름: student.name,
        종목: student.sports
      }

      let totalMinutes = 0
      Object.keys(attendance || {}).forEach(key => {
        const parts = key.split('-')
        const date = parts.slice(0, 3).join('-')
        const recordSport = parts[3]
        const studentId = parts[4]

        if (recordSport === selectedSport && studentId === student.id && date >= startDate && date <= endDate) {
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

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedSport)

    XLSX.writeFile(workbook, `${selectedSport}_${startDate}_${endDate}.xlsx`)
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
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#000' }}>
                    종목 선택
                  </label>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    style={{
                      padding: '10px',
                      width: '100%',
                      maxWidth: '300px',
                      borderRadius: '4px',
                      border: '2px solid #4a90e2',
                      fontSize: '15px',
                      color: '#000'
                    }}
                  >
                    <option value="">-- 종목을 선택하세요 --</option>
                    {Array.from(new Set(students.map(s => s.sports))).sort().map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#000' }}>
                      시작 날짜
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        padding: '10px',
                        width: '100%',
                        borderRadius: '4px',
                        border: '2px solid #4a90e2',
                        fontSize: '15px',
                        color: '#000'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#000' }}>
                      종료 날짜
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        padding: '10px',
                        width: '100%',
                        borderRadius: '4px',
                        border: '2px solid #4a90e2',
                        fontSize: '15px',
                        color: '#000'
                      }}
                    />
                  </div>
                </div>
              </div>

              <button className="btn-primary" onClick={handleExportExcel}>
                📊 엑셀로 내보내기
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminPanel
