import { useState } from 'react'
import './StudentManagement.css'

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

function StudentManagement({ students, setStudents }) {
  const [formData, setFormData] = useState({
    grade: '1',
    class: '1',
    number: '',
    name: '',
    sports: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [csvSport, setCsvSport] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [filterSport, setFilterSport] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddStudent = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.number || !formData.sports) {
      alert('모든 필드를 입력하세요')
      return
    }

    if (editingId) {
      setStudents(students.map(s => s.id === editingId ? { ...formData, id: editingId } : s))
      setEditingId(null)
    } else {
      const newStudent = {
        ...formData,
        id: Date.now().toString()
      }
      setStudents([...students, newStudent])
    }

    setFormData({ grade: '1', class: '1', number: '', name: '', sports: '' })
  }

  const handleEditStudent = (student) => {
    setFormData(student)
    setEditingId(student.id)
  }

  const handleDeleteStudent = (id) => {
    if (confirm('학생을 삭제하시겠습니까?')) {
      setStudents(students.filter(s => s.id !== id))
    }
  }

  const handleCsvUpload = (e) => {
    e.preventDefault()
    if (!csvFile || !csvSport) {
      alert('파일과 종목을 선택하세요')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csv = event.target.result
        const lines = csv.split('\n').filter(line => line.trim())

        // 첫 줄은 헤더이므로 스킵
        const newStudents = lines.slice(1).map(line => {
          const [grade, classNum, number, name] = line.split(',').map(col => col.trim())

          if (!grade || !classNum || !number || !name) return null

          return {
            grade,
            class: classNum,
            number,
            name,
            sports: csvSport,
            id: Date.now().toString() + Math.random()
          }
        }).filter(Boolean)

        setStudents([...students, ...newStudents])
        setCsvFile(null)
        setCsvSport('')
        alert(`${newStudents.length}명의 학생이 추가되었습니다`)
      } catch (error) {
        alert('CSV 파일 처리 중 오류가 발생했습니다')
        console.error(error)
      }
    }
    reader.readAsText(csvFile)
  }

  const filteredAndSortedStudents = [...students]
    .filter(s => !filterSport || s.sports === filterSport)
    .sort((a, b) => {
      if (a.grade !== b.grade) return parseInt(a.grade) - parseInt(b.grade)
      if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class)
      return parseInt(a.number) - parseInt(b.number)
    })

  return (
    <div className="student-management">
      <h2>학생 관리</h2>

      <div className="csv-upload-section">
        <h3>CSV 파일로 일괄 업로드</h3>
        <form className="csv-form" onSubmit={handleCsvUpload}>
          <div className="csv-form-row">
            <div className="form-group">
              <label>종목 선택</label>
              <select
                value={csvSport}
                onChange={(e) => setCsvSport(e.target.value)}
              >
                <option value="">종목 선택</option>
                {SPORTS.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>CSV 파일</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="btn-upload">
              업로드
            </button>
          </div>
        </form>
      </div>

      <hr className="divider" />

      <form className="student-form" onSubmit={handleAddStudent}>
        <div className="form-row">
          <div className="form-group">
            <label>학년</label>
            <select name="grade" value={formData.grade} onChange={handleInputChange}>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
          </div>

          <div className="form-group">
            <label>반</label>
            <select name="class" value={formData.class} onChange={handleInputChange}>
              {[1, 2, 3, 4, 5].map(i => (
                <option key={i} value={i}>{i}반</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>번호</label>
            <input
              type="number"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              placeholder="번호"
              min="1"
              max="50"
            />
          </div>

          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>종목</label>
            <select name="sports" value={formData.sports} onChange={handleInputChange}>
              <option value="">종목 선택</option>
              {SPORTS.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? '수정' : '추가'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditingId(null)
                setFormData({ grade: '1', class: '1', number: '', name: '', sports: '' })
              }}
            >
              취소
            </button>
          )}
        </div>
      </form>

      <div className="student-list">
        <div className="list-header">
          <h3>학생 목록 ({filteredAndSortedStudents.length}명 / 전체 {students.length}명)</h3>
          <div className="filter-group">
            <label>종목 필터:</label>
            <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)}>
              <option value="">전체</option>
              {SPORTS.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>학년</th>
              <th>반</th>
              <th>번호</th>
              <th>이름</th>
              <th>종목</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedStudents.map(student => (
              <tr key={student.id}>
                <td>{student.grade}</td>
                <td>{student.class}</td>
                <td>{student.number}</td>
                <td>{student.name}</td>
                <td>{student.sports}</td>
                <td className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEditStudent(student)}
                  >
                    수정
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAndSortedStudents.length === 0 && (
          <p className="empty">
            {students.length === 0 ? '학생을 추가하세요' : '해당 종목의 학생이 없습니다'}
          </p>
        )}
      </div>
    </div>
  )
}

export default StudentManagement
