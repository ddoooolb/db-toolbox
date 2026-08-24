import { useState } from 'react'
import './AttendanceMain.css'

const TIME_SLOTS = [
  { id: 'morning', name: '아침(오아시스)' },
  { id: 'lunch', name: '점심(자율)' },
  { id: 'afternoon', name: '방과후(자율)' },
  { id: 'direct-input', name: '📋 직접 입력' }
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
  '축구(여)',
  '농구(남)'
]

function AttendanceMain({ students, attendance, setAttendance }) {
  const [activeTimeSlot, setActiveTimeSlot] = useState('morning')
  const [activeSport, setActiveSport] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [bulkInputDate, setBulkInputDate] = useState(new Date().toISOString().split('T')[0])
  const [bulkInputSport, setBulkInputSport] = useState('')
  const [bulkSelectedStudents, setBulkSelectedStudents] = useState([])
  const [bulkInputMinutes, setBulkInputMinutes] = useState('120')
  const [minutesModalOpen, setMinutesModalOpen] = useState(false)
  const [minutesStudentId, setMinutesStudentId] = useState(null)
  const [minutesInput, setMinutesInput] = useState('60')

  const getDateKey = () => {
    return selectedDate
  }

  const handleMarkAttendance = (studentId) => {
    setMinutesStudentId(studentId)
    const dateKey = getDateKey()
    const recordKey = `${dateKey}-${activeSport}-${studentId}`
    const currentMinutes = attendance[recordKey]
    setMinutesInput(currentMinutes ? String(currentMinutes) : '60')
    setMinutesModalOpen(true)
  }

  const filteredStudents = students
    .filter(s => {
      if (!activeSport) return false
      // 배구(남/여) 탭에서 배구(남), 배구(여), 배구(남,여) 모두 포함
      if (activeSport === '배구(남)') {
        return s.sports === '배구(남)' || s.sports === '배구(남,여)'
      }
      if (activeSport === '배구(여)') {
        return s.sports === '배구(여)' || s.sports === '배구(남,여)'
      }
      if (activeSport === '배구(남,여)') {
        return s.sports === '배구(남)' || s.sports === '배구(여)' || s.sports === '배구(남,여)'
      }
      return s.sports === activeSport
    })
    .sort((a, b) => {
      if (a.grade !== b.grade) return parseInt(a.grade) - parseInt(b.grade)
      if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class)
      return parseInt(a.number) - parseInt(b.number)
    })

  const getFormattedDate = (dateStr = selectedDate) => {
    const date = new Date(dateStr + 'T00:00:00')
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const dayName = days[date.getDay()]
    return `${year}년 ${month}월 ${day}일 (${dayName})`
  }

  return (
    <div className="attendance-main">
      {/* 날짜 표시 (모든 탭에서 나타남) */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
        <label style={{ fontWeight: '700', color: '#000', whiteSpace: 'nowrap' }}>날짜:</label>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>
          {getFormattedDate(selectedDate)}
        </span>
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

      {activeTimeSlot && activeTimeSlot !== 'direct-input' && (
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

      {activeSport && activeTimeSlot !== 'direct-input' && (
        <div className="student-attendance">
          <h3>{activeSport} - 학생 목록</h3>
          {filteredStudents.length === 0 ? (
            <p className="no-students">등록된 학생이 없습니다</p>
          ) : (
            <div className="student-grid">
              {filteredStudents.map(student => {
                const dateKey = getDateKey()
                const recordKey = `${dateKey}-${activeSport}-${student.id}`
                const minutes = attendance[recordKey]
                const isMarked = minutes && parseFloat(minutes) > 0
                const hours = minutes ? Math.floor(parseFloat(minutes) / 60) : 0
                const mins = minutes ? parseFloat(minutes) % 60 : 0
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
                    {isMarked && (
                      <div className="checkmark">
                        {hours > 0 ? `${hours}h${mins}m` : `${minutes}m`}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 직접 입력 탭 */}
      {activeTimeSlot === 'direct-input' && !bulkInputSport && (
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#000' }}>
              날짜 선택
            </label>
            <input
              type="date"
              value={bulkInputDate}
              onChange={(e) => setBulkInputDate(e.target.value)}
              style={{
                padding: '10px',
                width: '100%',
                borderRadius: '4px',
                border: '2px solid #4a90e2',
                fontSize: '15px',
                fontWeight: '600',
                color: '#000',
                background: '#fff'
              }}
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#666' }}>
              📋 {getFormattedDate(bulkInputDate)}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px', color: '#000' }}>종목 선택</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {SPORTS.map(sport => (
                <button
                  key={sport}
                  onClick={() => {
                    setBulkInputSport(sport)
                    setBulkSelectedStudents([])
                  }}
                  style={{
                    padding: '10px',
                    background: '#f0f0f0',
                    color: '#000',
                    border: '1px solid #999',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#e0e0e0'
                    e.target.style.color = '#000'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#f0f0f0'
                    e.target.style.color = '#000'
                  }}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 직접 입력 - 학생 선택 */}
      {activeTimeSlot === 'direct-input' && bulkInputSport && (
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
              📋 {getFormattedDate(bulkInputDate)}
            </p>
            <h3 style={{ margin: '0', color: '#000' }}>{bulkInputSport}</h3>
          </div>

          <div style={{ marginBottom: '20px', padding: '15px', background: '#fff9e6', borderRadius: '8px', border: '1px solid #ffc107' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#000' }}>운동 시간 (분)</label>
            <input
              type="number"
              value={bulkInputMinutes}
              onChange={(e) => setBulkInputMinutes(e.target.value || '0')}
              min="0"
              step="10"
              style={{
                padding: '10px',
                width: '100px',
                borderRadius: '4px',
                border: '2px solid #ffc107',
                fontSize: '16px',
                fontWeight: '700',
                color: '#000'
              }}
            />
            <span style={{ marginLeft: '8px', fontWeight: '600', color: '#000' }}>분</span>
          </div>

          <button
            onClick={() => {
              setBulkInputSport('')
              setBulkSelectedStudents([])
            }}
            style={{
              padding: '8px 12px',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px',
              fontWeight: '600'
            }}
          >
            ← 뒤로
          </button>

          <div style={{ marginBottom: '20px', maxHeight: '500px', overflowY: 'auto' }}>
            {students
              .filter(s => s.sports === bulkInputSport || (
                (bulkInputSport === '배구(남)' && (s.sports === '배구(남,여)')) ||
                (bulkInputSport === '배구(여)' && (s.sports === '배구(남,여)'))
              ))
              .sort((a, b) => {
                if (a.grade !== b.grade) return parseInt(a.grade) - parseInt(b.grade)
                if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class)
                return parseInt(a.number) - parseInt(b.number)
              })
              .map(student => (
                <div
                  key={student.id}
                  onClick={() => {
                    if (bulkSelectedStudents.includes(student.id)) {
                      setBulkSelectedStudents(bulkSelectedStudents.filter(id => id !== student.id))
                    } else {
                      setBulkSelectedStudents([...bulkSelectedStudents, student.id])
                    }
                  }}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    background: bulkSelectedStudents.includes(student.id) ? '#e8f5e9' : '#f5f5f5',
                    border: `2px solid ${bulkSelectedStudents.includes(student.id) ? '#2f9e6e' : '#ddd'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontWeight: '600' }}>{student.grade}-{student.class}-{student.number} {student.name}</span>
                  {bulkSelectedStudents.includes(student.id) && <span style={{ fontSize: '18px', color: '#2f9e6e' }}>✓</span>}
                </div>
              ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                if (bulkSelectedStudents.length === 0) {
                  alert('선택된 학생이 없습니다.')
                  return
                }
                if (!bulkInputMinutes || parseFloat(bulkInputMinutes) <= 0) {
                  alert('운동 시간을 입력해주세요.')
                  return
                }
                bulkSelectedStudents.forEach(studentId => {
                  const recordKey = `${selectedDate}-${bulkInputSport}-${studentId}`
                  setAttendance(prev => ({
                    ...prev,
                    [recordKey]: parseFloat(bulkInputMinutes)
                  }))
                })
                const hours = Math.floor(parseFloat(bulkInputMinutes) / 60)
                const mins = parseFloat(bulkInputMinutes) % 60
                const timeStr = hours > 0 ? `${hours}시간 ${mins}분` : `${bulkInputMinutes}분`
                alert(`${bulkSelectedStudents.length}명의 학생 출석이 입력되었습니다.\n운동 시간: ${timeStr}`)
                setActiveTimeSlot('')
                setBulkInputSport('')
                setBulkSelectedStudents([])
                setBulkInputMinutes('120')
              }}
              style={{
                flex: 1,
                padding: '14px',
                background: '#2f9e6e',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              ✓ 입력 완료 ({bulkSelectedStudents.length}명)
            </button>
            <button
              onClick={() => {
                setActiveTimeSlot('')
                setBulkInputSport('')
                setBulkSelectedStudents([])
              }}
              style={{
                flex: 1,
                padding: '14px',
                background: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 분 입력 모달 */}
      {minutesModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#000' }}>
              운동 시간 입력 (분)
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="number"
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                min="0"
                step="10"
                placeholder="60"
                style={{
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  border: '2px solid #4a90e2',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000',
                  background: '#ffffff',
                  WebkitAutofill: {
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    WebkitTextFillColor: '#000'
                  }
                }}
                autoFocus
              />
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                예: 60분 = 1시간, 120분 = 2시간
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (!minutesInput || parseFloat(minutesInput) < 0) {
                    alert('올바른 시간을 입력해주세요.')
                    return
                  }
                  const dateKey = getDateKey()
                  const recordKey = `${dateKey}-${activeSport}-${minutesStudentId}`
                  setAttendance(prev => ({
                    ...prev,
                    [recordKey]: parseFloat(minutesInput)
                  }))
                  setMinutesModalOpen(false)
                  setMinutesStudentId(null)
                  setMinutesInput('60')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2f9e6e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                ✓ 저장
              </button>
              <button
                onClick={() => {
                  setMinutesModalOpen(false)
                  setMinutesStudentId(null)
                  setMinutesInput('60')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '15px',
                  color: '#000'
                }}
              >
                취소
              </button>
            </div>

            <button
              onClick={() => {
                const dateKey = getDateKey()
                const recordKey = `${dateKey}-${activeSport}-${minutesStudentId}`
                setAttendance(prev => {
                  const newAttendance = {...prev}
                  delete newAttendance[recordKey]
                  return newAttendance
                })
                setMinutesModalOpen(false)
                setMinutesStudentId(null)
                setMinutesInput('60')
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#ffebee',
                color: '#c0392b',
                border: '1px solid #c0392b',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px',
                marginTop: '12px'
              }}
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceMain
