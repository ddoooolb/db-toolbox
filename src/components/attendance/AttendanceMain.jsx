import { useState } from 'react'
import './AttendanceMain.css'

const TIME_SLOTS = [
  { id: 'morning', name: '아침(오아시스)' },
  { id: 'lunch', name: '점심(자율)' },
  { id: 'afternoon', name: '방과후(자율)' }
]

const SPORTS = [
  '배구(남)',
  '배구(여)',
  '배구(남,여)',
  '배드민턴(남,여)',
  '피구(여)',
  '연식야구(남)',
  '티볼(여)',
  '축구(남)',
  '축구(여)'
]

function AttendanceMain({ students, attendance, setAttendance }) {
  const [activeTimeSlot, setActiveTimeSlot] = useState('')
  const [activeSport, setActiveSport] = useState('')

  const getDateKey = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const handleMarkAttendance = (studentId) => {
    const dateKey = getDateKey()
    const recordKey = `${dateKey}-${activeSport}-${studentId}`
    setAttendance(prev => ({
      ...prev,
      [recordKey]: !prev[recordKey]
    }))
  }

  const filteredStudents = students
    .filter(s => s.sports === activeSport)
    .sort((a, b) => {
      if (a.grade !== b.grade) return parseInt(a.grade) - parseInt(b.grade)
      if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class)
      return parseInt(a.number) - parseInt(b.number)
    })

  const getFormattedDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const date = now.getDate()
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const day = days[now.getDay()]
    return `${year}년 ${month}월 ${date}일 (${day})`
  }

  return (
    <div className="attendance-main">
      <div className="attendance-header">
        <div>
          <p className="today">{getFormattedDate()}</p>
          <h2>학교스포츠클럽 출석</h2>
        </div>
      </div>

      <div className="time-slots">
        {TIME_SLOTS.map(slot => (
          <button
            key={slot.id}
            className={`slot-button ${activeTimeSlot === slot.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTimeSlot(slot.id)
              setActiveSport('')
            }}
          >
            {slot.name}
          </button>
        ))}
      </div>

      {activeTimeSlot && (
        <div className="sports-selection">
          <h3>종목 선택</h3>
          <div className="sports-grid">
            {SPORTS.map(sport => (
              <button
                key={sport}
                className={`sport-button ${activeSport === sport ? 'active' : ''}`}
                onClick={() => setActiveSport(sport)}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSport && (
        <div className="student-attendance">
          <h3>{activeSport} - 학생 목록</h3>
          {filteredStudents.length === 0 ? (
            <p className="no-students">등록된 학생이 없습니다</p>
          ) : (
            <div className="student-grid">
              {filteredStudents.map(student => {
                const dateKey = getDateKey()
                const recordKey = `${dateKey}-${activeSport}-${student.id}`
                const isMarked = attendance[recordKey]
                return (
                  <button
                    key={student.id}
                    className={`student-button ${isMarked ? 'marked' : ''}`}
                    onClick={() => handleMarkAttendance(student.id)}
                  >
                    <div className="student-info">
                      {student.grade}-{student.class}-{student.number}
                    </div>
                    <div className="student-name">{student.name}</div>
                    {isMarked && <div className="checkmark">✓</div>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AttendanceMain
