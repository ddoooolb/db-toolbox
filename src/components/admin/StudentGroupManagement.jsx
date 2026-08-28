import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { initialGroupsData } from '../../data/groupsData'
import './StudentGroupManagement.css'

// groupsData에서 반별 학생 목록 추출
const extractStudentsFromGroups = () => {
  const students = []
  Object.entries(initialGroupsData).forEach(([classId, classGroups]) => {
    const classParts = classId.match(/(\d+)학년\s*(\d+)반/)
    if (!classParts) return
    const grade = classParts[1]
    const classNum = classParts[2]

    // 각 조의 members에서 직접 학생 정보 추출
    Object.values(classGroups).forEach(group => {
      group.members?.forEach(member => {
        students.push({
          id: `${classId}-${member.name}`,
          grade: grade,
          class: classNum,
          number: member.number,
          name: member.name
        })
      })
    })
  })
  return students.sort((a, b) => {
    if (a.class !== b.class) return parseInt(a.class) - parseInt(b.class)
    return parseInt(a.number) - parseInt(b.number)
  })
}

function StudentGroupManagement() {
  const [tab, setTab] = useState('input')
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', number: '', class: '', grade: '' })
  const [editingId, setEditingId] = useState(null)

  // 저장된 데이터 로드
  useEffect(() => {
    // groupsData에서 동료평가용 반별 학생 목록 추출
    const groupStudents = extractStudentsFromGroups()
    setStudents(groupStudents)
    const classes = [...new Set(groupStudents.map(s => s.class))]
    if (classes.length > 0) setSelectedClass(classes[0])
  }, [])

  // 엑셀 업로드 처리
  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = event.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // 헤더 찾기 (첫 행에서 "학년", "반", "번호", "이름" 찾기)
      let headerIdx = 0
      let gradeCol = -1, classCol = -1, numCol = -1, nameCol = -1

      for (let i = 0; i < Math.min(5, rows.length); i++) {
        const row = rows[i]
        if (Array.isArray(row)) {
          gradeCol = row.findIndex(c => String(c).includes('학년'))
          classCol = row.findIndex(c => String(c).includes('반'))
          numCol = row.findIndex(c => String(c).includes('번호'))
          nameCol = row.findIndex(c => String(c).includes('이름'))

          if (gradeCol >= 0 && classCol >= 0 && numCol >= 0 && nameCol >= 0) {
            headerIdx = i + 1
            break
          }
        }
      }

      // 헤더를 못 찾으면 첫 번째 행이 열 이름이라고 가정
      if (gradeCol < 0 || classCol < 0 || numCol < 0 || nameCol < 0) {
        gradeCol = 0
        classCol = 1
        numCol = 2
        nameCol = 3
        headerIdx = 1
      }

      const parsed = rows.slice(headerIdx).map((row, idx) => ({
        id: idx + 1,
        grade: String(row[gradeCol] || '3').trim(),
        class: String(row[classCol] || '').trim(),
        number: String(row[numCol] || '').trim(),
        name: String(row[nameCol] || '').trim()
      })).filter(s => s.name && s.class)

      setStudents(parsed)
      localStorage.setItem('students-data', JSON.stringify(parsed))
      const classes = [...new Set(parsed.map(s => s.class))]
      if (classes.length > 0) setSelectedClass(classes[0])
      alert(`${parsed.length}명의 학생이 추가되었습니다!`)
    }
    reader.readAsBinaryString(file)
  }

  // 학생 추가
  const addStudent = () => {
    if (!editForm.name || !editForm.class) {
      alert('이름과 반을 입력하세요.')
      return
    }
    const newStudent = {
      id: editingId || Date.now(),
      name: editForm.name,
      number: editForm.number,
      class: editForm.class,
      grade: editForm.grade || '3'
    }
    let updated
    if (editingId) {
      updated = students.map(s => s.id === editingId ? newStudent : s)
    } else {
      updated = [...students, newStudent]
    }
    setStudents(updated)
    localStorage.setItem('students-data', JSON.stringify(updated))
    setEditForm({ name: '', number: '', class: '', grade: '' })
    setEditingId(null)
    alert(editingId ? '수정되었습니다!' : '추가되었습니다!')
  }

  // 학생 삭제
  const deleteStudent = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    const updated = students.filter(s => s.id !== id)
    setStudents(updated)
    localStorage.setItem('students-data', JSON.stringify(updated))
  }

  // 수정 시작
  const startEdit = (student) => {
    setEditForm(student)
    setEditingId(student.id)
  }

  return (
    <div className="sgm-container">
      <h2>📚 학생/조 관리</h2>

      <nav className="sgm-tabs">
        <button
          className={`sgm-tab ${tab === 'input' ? 'active' : ''}`}
          onClick={() => setTab('input')}
        >
          1. 데이터 입력
        </button>
      </nav>

      {/* 데이터 입력 탭 */}
      {tab === 'input' && (
        <>
          <div className="sgm-card">
            <h3>엑셀 파일 업로드</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
              📋 양식: 이름 | 반 | 번호 열이 있어야 합니다
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%'
              }}
            />
            {students.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p><strong>✓ {students.length}명 등록됨</strong></p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[...new Set(students.map(s => s.class))].map(cls => (
                    <span
                      key={cls}
                      style={{
                        background: '#e8f7f0',
                        color: '#2f9e6e',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}
                    >
                      {cls}: {students.filter(s => s.class === cls).length}명
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sgm-card">
            <h3>개별 학생 {editingId ? '수정' : '추가'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="이름"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="번호"
                value={editForm.number}
                onChange={(e) => setEditForm({...editForm, number: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="반 (예: 3-12)"
                value={editForm.class}
                onChange={(e) => setEditForm({...editForm, class: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="학년"
                value={editForm.grade}
                onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={addStudent}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#ff6b4a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                {editingId ? '수정' : '추가'}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditForm({ name: '', number: '', class: '', grade: '' })
                    setEditingId(null)
                  }}
                  style={{
                    padding: '10px 16px',
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700'
                  }}
                >
                  취소
                </button>
              )}
            </div>
          </div>

          {students.length > 0 && (
            <div className="sgm-card">
              <h3>학생 목록</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700' }}>학년</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700' }}>반</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700' }}>번호</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700' }}>이름</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700', width: '80px' }}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{student.grade}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{student.class}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{student.number}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{student.name}</td>
                      <td style={{ padding: '8px', textAlign: 'center', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          onClick={() => startEdit(student)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: '#e8f7f0',
                            color: '#2f9e6e',
                            border: '1px solid #2f9e6e',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '700'
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: '#fdeceb',
                            color: '#c0392b',
                            border: '1px solid #c0392b',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '700'
                          }}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StudentGroupManagement
