import { useState } from 'react'
import './AttendanceStatistics.css'

function AttendanceStatistics({ students, attendance }) {
  const [selectedSport, setSelectedSport] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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

  const calculateStatistics = (sport, start, end) => {
    if (!sport) return null

    // 해당 종목의 학생들
    const sportStudents = students.filter(s => s.sports === sport || (
      sport === '배구(남)' && s.sports === '배구(남,여)' ||
      sport === '배구(여)' && s.sports === '배구(남,여)'
    ))
    if (sportStudents.length === 0) return null

    // 해당 종목의 모든 운영일 찾기
    const operatingDates = new Set()
    Object.keys(attendance).forEach(key => {
      const [date, recordSport] = key.split('-').slice(0, 2)
      if (recordSport === sport) {
        // 날짜 범위 필터링
        if (start && end) {
          if (date >= start && date <= end) {
            operatingDates.add(date)
          }
        } else {
          operatingDates.add(date)
        }
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

  const stats = calculateStatistics(selectedSport, startDate, endDate)

  const getColorClass = (rate) => {
    if (rate >= 80) return 'rate-high'
    if (rate >= 50) return 'rate-medium'
    return 'rate-low'
  }

  return (
    <div className="statistics">
      <h2>출석 통계</h2>

      <div className="sport-selector">
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#000' }}>종목 선택:</label>
          <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }}>
            <option value="">선택하세요</option>
            {SPORTS.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#000', fontSize: '13px' }}>시작 날짜:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc', color: '#000', background: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#000', fontSize: '13px' }}>종료 날짜:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc', color: '#000', background: '#fff' }}
            />
          </div>
        </div>

        {selectedSport && (startDate || endDate) && (
          <div style={{ marginTop: '12px', padding: '10px', background: '#e8f5e9', borderRadius: '4px', fontSize: '12px', color: '#2f9e6e', fontWeight: '600' }}>
            📊 {startDate && `${startDate}부터`} {endDate && `${endDate}까지`} 데이터
          </div>
        )}
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
