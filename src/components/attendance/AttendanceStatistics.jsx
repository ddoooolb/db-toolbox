import { useState } from 'react'
import './AttendanceStatistics.css'

function AttendanceStatistics({ students, attendance }) {
  const [selectedSport, setSelectedSport] = useState('')

  const SPORTS = [
    '배구(남)',
    '배구(여)',
    '배구(남,여)',
    '배드민턴(남,여)',
    '피구(여)',
    '연식야구(남)',
    '티볼(여)',
    '축구(남)',
    '축구(여)',
    '농구(남)'
  ]

  const calculateStatistics = (sport) => {
    if (!sport) return null

    // 해당 종목의 학생들
    const sportStudents = students.filter(s => s.sports === sport)
    if (sportStudents.length === 0) return null

    // 해당 종목의 모든 운영일 찾기
    const operatingDates = new Set()
    Object.keys(attendance).forEach(key => {
      const [date, recordSport] = key.split('-').slice(0, 2)
      if (recordSport === sport) {
        operatingDates.add(date)
      }
    })

    const totalOperatingDays = operatingDates.size
    if (totalOperatingDays === 0) return null

    // 학생별 출석 일수 계산
    const studentStats = sportStudents.map(student => {
      const attendanceDates = new Set()

      operatingDates.forEach(date => {
        // 그 날 학생이 아침/점심/방과후 중 하나라도 출석했는지 확인
        const recordKey = `${date}-${sport}-${student.id}`
        if (attendance[recordKey]) {
          attendanceDates.add(date)
        }
      })

      const attendanceDays = attendanceDates.size
      const attendanceRate = totalOperatingDays > 0 ? (attendanceDays / totalOperatingDays) * 100 : 0

      return {
        id: student.id,
        name: student.name,
        grade: student.grade,
        class: student.class,
        number: student.number,
        attendanceDays,
        attendanceRate
      }
    })

    return {
      sport,
      totalOperatingDays,
      students: studentStats.sort((a, b) => {
        if (a.grade !== b.grade) return parseInt(a.grade) - parseInt(b.grade)
        if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class)
        return parseInt(a.number) - parseInt(b.number)
      })
    }
  }

  const stats = calculateStatistics(selectedSport)

  const getColorClass = (rate) => {
    if (rate >= 80) return 'rate-high'
    if (rate >= 50) return 'rate-medium'
    return 'rate-low'
  }

  return (
    <div className="statistics">
      <h2>출석 통계</h2>

      <div className="sport-selector">
        <label>종목 선택:</label>
        <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)}>
          <option value="">선택하세요</option>
          {SPORTS.map(sport => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>
      </div>

      {stats ? (
        <div className="statistics-table">
          <div className="table-header">
            <h3>{stats.sport}</h3>
            <p className="info">총 운영일: {stats.totalOperatingDays}일</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>학년</th>
                <th>반</th>
                <th>번호</th>
                <th>이름</th>
                <th>출석일</th>
                <th>출석률</th>
              </tr>
            </thead>
            <tbody>
              {stats.students.map(student => (
                <tr key={student.id}>
                  <td>{student.grade}</td>
                  <td>{student.class}</td>
                  <td>{student.number}</td>
                  <td>{student.name}</td>
                  <td className="attendance-days">
                    {student.attendanceDays} / {stats.totalOperatingDays}
                  </td>
                  <td className="attendance-rate">
                    <div className={`rate-bar ${getColorClass(student.attendanceRate)}`}>
                      <div
                        className="rate-fill"
                        style={{ width: `${student.attendanceRate}%` }}
                      >
                        {student.attendanceRate.toFixed(1)}%
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-message">
          {selectedSport ? '해당 종목의 출석 데이터가 없습니다' : '종목을 선택하세요'}
        </p>
      )}

      <div className="legend">
        <span className="legend-high">80% 이상</span>
        <span className="legend-medium">50% ~ 80%</span>
        <span className="legend-low">50% 미만</span>
      </div>
    </div>
  )
}

export default AttendanceStatistics
