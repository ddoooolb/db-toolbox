import { useState } from 'react'
import * as XLSX from 'xlsx'
import { db } from '../../firebase'
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore'
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

  const handleAddStudent = async (e) => {
    e.preventDefault()
    console.log('handleAddStudent 호출됨, formData:', formData)

    if (!formData.name || !formData.number || !formData.sports) {
      alert('모든 필드를 입력하세요')
      return
    }

    try {
      console.log('═══ 학생 저장 시작 ═══')
      console.log('데이터:', formData)
      if (editingId) {
        // 수정
        console.log('수정 모드')
        const updated = { ...formData, id: editingId }

        // localStorage에 저장
        const savedStudents = JSON.parse(localStorage.getItem('students-data') || '[]')
        const idx = savedStudents.findIndex(s => s.id === editingId)
        if (idx >= 0) {
          savedStudents[idx] = updated
        } else {
          savedStudents.push(updated)
        }
        localStorage.setItem('students-data', JSON.stringify(savedStudents))
        console.log('✓ localStorage 수정 저장')

        // Firestore에 저장
        const docRef = doc(db, 'students', editingId)
        await setDoc(docRef, updated)
        console.log('✓ Firestore 수정 저장')

        setStudents(students.map(s => s.id === editingId ? updated : s))
        setEditingId(null)
      } else {
        // 추가
        console.log('추가 모드')
        const newStudents = []

        const newStudent = {
          ...formData,
          id: Date.now().toString()
        }
        newStudents.push(newStudent)

        console.log('Firestore에 저장할 학생:', newStudents)

        // localStorage에 저장
        const savedStudents = JSON.parse(localStorage.getItem('students-data') || '[]')
        const allSavedStudents = [...savedStudents, ...newStudents]
        localStorage.setItem('students-data', JSON.stringify(allSavedStudents))
        console.log('✓ localStorage 저장:', allSavedStudents.length)

        // Firestore에 저장
        for (const student of newStudents) {
          console.log('저장 중:', student.name, student.id)
          try {
            const docRef = doc(db, 'students', student.id)
            await setDoc(docRef, student)
            console.log('✓ Firestore 저장 완료:', student.name)
          } catch (error) {
            console.error('✗ Firestore 저장 오류:', student.name, error.code, error.message)
          }
        }

        console.log('✓ 상태 업데이트')
        setStudents([...students, ...newStudents])
      }

      console.log('폼 초기화')
      setFormData({ grade: '1', class: '1', number: '', name: '', sports: '' })
      alert('저장되었습니다!')
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다: ' + error.message)
    }
  }

  const handleEditStudent = (student) => {
    setFormData(student)
    setEditingId(student.id)
  }

  const handleDeleteStudent = async (id) => {
    if (confirm('학생을 삭제하시겠습니까?')) {
      try {
        // localStorage에서 삭제
        const savedStudents = JSON.parse(localStorage.getItem('students-data') || '[]')
        const filtered = savedStudents.filter(s => s.id !== id)
        localStorage.setItem('students-data', JSON.stringify(filtered))
        console.log('✓ localStorage 삭제')

        // Firestore에서 삭제
        const docRef = doc(db, 'students', id)
        await deleteDoc(docRef)
        console.log('✓ Firestore 삭제')

        setStudents(students.filter(s => s.id !== id))
      } catch (error) {
        console.error('✗ 삭제 오류:', error)
        alert('삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const handleCsvUpload = (e) => {
    e.preventDefault()
    if (!csvFile || !csvSport) {
      alert('파일과 종목을 선택하세요')
      return
    }

    const isExcel = csvFile.name.endsWith('.xlsx') || csvFile.name.endsWith('.xls')

    if (isExcel) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          const newStudents = []

          jsonData.forEach(row => {
            const grade = String(row.grade || row['학년'] || '')
            const classNum = String(row.class || row['반'] || '')
            const number = String(row.number || row['번호'] || '')
            const name = String(row.name || row['이름'] || '')

            if (!grade || !classNum || !number || !name) return

            const student = {
              grade: grade.trim(),
              class: classNum.trim(),
              number: number.trim(),
              name: name.trim(),
              sports: csvSport,
              id: Date.now().toString() + Math.random()
            }
            newStudents.push(student)

          })

          // localStorage에 먼저 저장
          const savedStudents = JSON.parse(localStorage.getItem('students-data') || '[]')
          const allSavedStudents = [...savedStudents, ...newStudents]
          localStorage.setItem('students-data', JSON.stringify(allSavedStudents))
          console.log('✓ CSV localStorage 저장:', allSavedStudents.length)

          // 상태 업데이트 (localStorage 반영)
          setStudents([...students, ...newStudents])

          // Firestore에 저장
          Promise.all(newStudents.map(student => {
            const docRef = doc(db, 'students', student.id)
            return setDoc(docRef, student)
          })).then(() => {
            setCsvFile(null)
            setCsvSport('')
            alert(`${newStudents.length}명의 학생이 추가되었습니다`)
          }).catch(error => {
            console.error('CSV Firestore 저장 오류:', error)
            alert('저장 중 오류가 발생했습니다.')
          })
        } catch (error) {
          alert('Excel 파일 처리 중 오류가 발생했습니다')
          console.error(error)
        }
      }
      reader.readAsArrayBuffer(csvFile)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const csv = event.target.result
          const lines = csv.split('\n').filter(line => line.trim())

          const newStudents = []

          lines.slice(1).forEach(line => {
            const [grade, classNum, number, name] = line.split(',').map(col => col.trim())

            if (!grade || !classNum || !number || !name) return

            const student = {
              grade,
              class: classNum,
              number,
              name,
              sports: csvSport,
              id: Date.now().toString() + Math.random()
            }
            newStudents.push(student)

          })

          // localStorage에 먼저 저장
          const savedStudents = JSON.parse(localStorage.getItem('students-data') || '[]')
          const allSavedStudents = [...savedStudents, ...newStudents]
          localStorage.setItem('students-data', JSON.stringify(allSavedStudents))
          console.log('✓ CSV localStorage 저장:', allSavedStudents.length)

          // 상태 업데이트 (localStorage 반영)
          setStudents([...students, ...newStudents])

          // Firestore에 저장
          Promise.all(newStudents.map(student => {
            const docRef = doc(db, 'students', student.id)
            return setDoc(docRef, student)
          })).then(() => {
            setCsvFile(null)
            setCsvSport('')
            alert(`${newStudents.length}명의 학생이 추가되었습니다`)
          }).catch(error => {
            console.error('CSV Firestore 저장 오류:', error)
            alert('저장 중 오류가 발생했습니다.')
          })
        } catch (error) {
          alert('CSV 파일 처리 중 오류가 발생했습니다')
          console.error(error)
        }
      }
      reader.readAsText(csvFile)
    }
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
        <h3>CSV/Excel 파일로 일괄 업로드</h3>
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
              <label>CSV/Excel 파일</label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
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
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              placeholder="예: 3"
            />
          </div>

          <div className="form-group">
            <label>반</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              placeholder="예: 1"
            />
          </div>

          <div className="form-group">
            <label>번호</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              placeholder="예: 15"
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
