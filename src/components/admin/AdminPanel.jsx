import { useState } from 'react'
import * as XLSX from 'xlsx'
import StudentManagement from './StudentManagement'
import AttendanceStatistics from '../attendance/AttendanceStatistics'
import { getEncryptedItem } from '../../utils/encryption'
import './AdminPanel.css'

function AdminPanel({ students, setStudents, attendance, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('students')
  const [selectedSport, setSelectedSport] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })

  const handleExportExcel = () => {
    console.log('선택된 값:', { selectedSport, startDate, endDate })
    console.log('현재 attendance 데이터:', attendance)
    console.log('attendance의 모든 key:', Object.keys(attendance))
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

    // 날짜 범위의 모든 고유 날짜 추출
    const allDates = new Set()
    Object.keys(attendance || {}).forEach(key => {
      const parts = key.split('-')
      const date = parts.slice(0, 3).join('-')
      const recordSport = parts[3]
      if (recordSport === selectedSport && date >= startDate && date <= endDate) {
        allDates.add(date)
      }
    })
    const sortedDates = Array.from(allDates).sort()

    const data = sportStudents.map(student => {
      const record = {
        학년: student.grade,
        반: student.class,
        번호: student.number,
        이름: student.name,
        종목: student.sports
      }

      let totalMinutes = 0
      sortedDates.forEach(date => {
        const attendanceKey = `${date}-${selectedSport}-${student.id}`
        const minutes = attendance[attendanceKey] || 0
        record[date] = parseFloat(minutes) > 0 ? parseFloat(minutes) : 0
        totalMinutes += parseFloat(minutes) || 0
      })

      record['총시간(분)'] = totalMinutes

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
          <button
            className={`nav-item ${activeMenu === 'danceBackup' ? 'active' : ''}`}
            onClick={() => setActiveMenu('danceBackup')}
          >
            💾 댄스평가 백업
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
              <div className="export-form">
                <div className="export-group">
                  <label>종목 선택</label>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                  >
                    <option value="">-- 종목을 선택하세요 --</option>
                    {Array.from(new Set(students.map(s => s.sports))).sort().map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <div className="export-dates">
                  <div className="export-group">
                    <label>시작 날짜</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="export-group">
                    <label>종료 날짜</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button className="btn-primary" onClick={handleExportExcel}>
                📊 엑셀로 내보내기
              </button>
            </div>
          )}

          {activeMenu === 'danceBackup' && (
            <div className="menu-section">
              <h2>💾 댄스평가 데이터 백업</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                현재 저장된 모든 댄스 평가 데이터를 JSON 파일로 다운로드합니다.
              </p>
              <button
                className="btn-primary"
                onClick={() => {
                  const backupData = {}
                  // 모든 반의 평가 데이터 수집
                  for (let i = 1; i <= 3; i++) {
                    for (let j = 1; j <= 12; j++) {
                      const classId = `${i}학년 ${j}반`
                      const records = getEncryptedItem(`dance-eval-records:${classId}`) || {}
                      const submitted = getEncryptedItem(`dance-eval-submitted:${classId}`) || {}
                      const teacherResult = getEncryptedItem(`dance-eval-teacher-result:${classId}`) || {}

                      if (Object.keys(records).length > 0 || Object.keys(submitted).length > 0) {
                        backupData[classId] = {
                          records,
                          submitted,
                          teacherResult,
                          timestamp: new Date().toISOString()
                        }
                      }
                    }
                  }

                  if (Object.keys(backupData).length === 0) {
                    alert('백업할 데이터가 없습니다.')
                    return
                  }

                  // 파일 다운로드
                  const dataStr = JSON.stringify(backupData, null, 2)
                  const dataBlob = new Blob([dataStr], { type: 'application/json' })
                  const url = URL.createObjectURL(dataBlob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `댄스평가_백업_${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  URL.revokeObjectURL(url)

                  alert('백업이 완료되었습니다.')
                }}
              >
                📥 지금 백업 다운로드
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminPanel
