import { useState } from 'react'
import AttendanceMain from './AttendanceMain'
import './AttendancePublic.css'

function AttendancePublic({ students }) {
  const [attendance, setAttendance] = useState({})

  return (
    <div className="attendance-public">
      <header className="public-header">
        <h1>학교스포츠클럽 출석</h1>
        <p className="subtitle">태블릿 전용 출석 페이지</p>
      </header>

      <main className="public-content">
        <AttendanceMain
          students={students}
          attendance={attendance}
          setAttendance={setAttendance}
        />
      </main>

      <footer className="public-footer">
        <p>이 페이지는 출석 체크만 가능합니다</p>
      </footer>
    </div>
  )
}

export default AttendancePublic
