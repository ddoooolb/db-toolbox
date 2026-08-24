import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import './StudentGroupManagement.css'

function StudentGroupManagement() {
  const [tab, setTab] = useState('input')
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [groups, setGroups] = useState({})
  const [groupCount, setGroupCount] = useState(4)
  const [students2Assign, setStudents2Assign] = useState([])
  const [draggedStudent, setDraggedStudent] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', number: '', class: '', grade: '' })
  const [editingId, setEditingId] = useState(null)

  // 저장된 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem('students-data')
    if (saved) {
      setStudents(JSON.parse(saved))
      const classes = [...new Set(JSON.parse(saved).map(s => s.class))]
      if (classes.length > 0) setSelectedClass(classes[0])
    }
    const savedGroups = localStorage.getItem('groups-data')
    if (savedGroups) setGroups(JSON.parse(savedGroups))
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

  // 반별 학생 필터링
  const classStudents = students.filter(s => s.class === selectedClass) || []

  // 조 편성 시작
  const startGrouping = () => {
    setStudents2Assign([...classStudents].sort(() => Math.random() - 0.5))
    const newGroups = {}
    for (let i = 1; i <= groupCount; i++) {
      newGroups[`${i}조`] = []
    }
    setGroups(newGroups)
  }

  // 드래그 종료
  const handleDrop = (groupName) => {
    if (!draggedStudent) return
    const newGroups = { ...groups }
    newGroups[groupName] = [...(newGroups[groupName] || []), draggedStudent]
    setStudents2Assign(students2Assign.filter(s => s.id !== draggedStudent.id))
    setGroups(newGroups)
    setDraggedStudent(null)
  }

  // 학생 제거
  const removeStudent = (groupName, studentId) => {
    const student = groups[groupName].find(s => s.id === studentId)
    const newGroups = { ...groups }
    newGroups[groupName] = newGroups[groupName].filter(s => s.id !== studentId)
    setGroups(newGroups)
    setStudents2Assign([...students2Assign, student])
  }

  // 조장 선택
  const setLeader = (groupName, studentId) => {
    const saved = localStorage.getItem('groups-data')
    const allGroups = saved ? JSON.parse(saved) : {}
    if (!allGroups[selectedClass]) allGroups[selectedClass] = {}
    if (!allGroups[selectedClass][groupName]) {
      allGroups[selectedClass][groupName] = { members: groups[groupName] || [], leader: null }
    }
    allGroups[selectedClass][groupName].leader = studentId
    localStorage.setItem('groups-data', JSON.stringify(allGroups))
    alert('조장이 설정되었습니다!')
  }

  // 조 편성 저장
  const saveGrouping = () => {
    const saved = localStorage.getItem('groups-data')
    const allGroups = saved ? JSON.parse(saved) : {}
    allGroups[selectedClass] = {}
    Object.keys(groups).forEach(groupName => {
      allGroups[selectedClass][groupName] = {
        members: groups[groupName],
        leader: null
      }
    })
    localStorage.setItem('groups-data', JSON.stringify(allGroups))
    alert('조 편성이 저장되었습니다!')
    setTab('view')
  }

  // 학생 목록 보기
  const savedData = localStorage.getItem('groups-data')
  const classGroups = savedData ? JSON.parse(savedData)[selectedClass] : null

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
        <button
          className={`sgm-tab ${tab === 'assign' ? 'active' : ''}`}
          onClick={() => setTab('assign')}
        >
          2. 조 편성
        </button>
        <button
          className={`sgm-tab ${tab === 'view' ? 'active' : ''}`}
          onClick={() => setTab('view')}
        >
          3. 현황 보기
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
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: '700' }}>이름</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: '700' }}>번호</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: '700' }}>반</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700', width: '80px' }}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px' }}>{student.name}</td>
                      <td style={{ padding: '8px' }}>{student.number}</td>
                      <td style={{ padding: '8px' }}>{student.class}</td>
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

      {/* 조 편성 탭 */}
      {tab === 'assign' && (
        <div className="sgm-card">
          <h3>조 편성</h3>
          {students.length === 0 ? (
            <p style={{ color: '#999' }}>먼저 학생 데이터를 입력하세요.</p>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label>
                  반 선택:{' '}
                  <select
                    value={selectedClass || ''}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    {[...new Set(students.map(s => s.class))].map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </label>
              </div>

              {students2Assign.length === 0 ? (
                <div style={{ marginBottom: '16px' }}>
                  <label>
                    조 개수:{' '}
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={groupCount}
                      onChange={(e) => setGroupCount(Number(e.target.value))}
                      style={{ width: '60px', padding: '6px', border: '1px solid #ddd' }}
                    />
                  </label>
                  <button
                    onClick={startGrouping}
                    style={{
                      marginLeft: '12px',
                      padding: '8px 16px',
                      background: '#ff6b4a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '700'
                    }}
                  >
                    조 편성 시작
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    {/* 미배치 학생 */}
                    <div style={{
                      background: '#f5f5f5',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px dashed #ddd'
                    }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700' }}>
                        미배치 ({students2Assign.length}명)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {students2Assign.map(student => (
                          <div
                            key={student.id}
                            draggable
                            onDragStart={() => setDraggedStudent(student)}
                            style={{
                              background: '#fff',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              cursor: 'move',
                              fontSize: '13px',
                              border: '1px solid #ddd',
                              userSelect: 'none'
                            }}
                          >
                            {student.name} ({student.number})
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 조별 목록 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {Object.keys(groups).map(groupName => (
                        <div
                          key={groupName}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(groupName)}
                          style={{
                            background: '#fafafa',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '2px solid #ddd',
                            minHeight: '200px'
                          }}
                        >
                          <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700' }}>
                            {groupName} ({groups[groupName]?.length || 0}명)
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {groups[groupName]?.map((student, idx) => (
                              <div
                                key={student.id}
                                style={{
                                  background: '#fff',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  border: '1px solid #ddd',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <span>{student.name} ({student.number})</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    onClick={() => setLeader(groupName, student.id)}
                                    style={{
                                      padding: '2px 6px',
                                      fontSize: '11px',
                                      background: '#fff2ee',
                                      color: '#ff6b4a',
                                      border: '1px solid #ff6b4a',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '700'
                                    }}
                                  >
                                    👑
                                  </button>
                                  <button
                                    onClick={() => removeStudent(groupName, student.id)}
                                    style={{
                                      padding: '2px 6px',
                                      fontSize: '11px',
                                      background: '#fdeceb',
                                      color: '#c0392b',
                                      border: '1px solid #c0392b',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setStudents2Assign([])
                        setGroups({})
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
                      처음부터
                    </button>
                    <button
                      onClick={saveGrouping}
                      disabled={students2Assign.length > 0}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: students2Assign.length > 0 ? '#ccc' : '#2f9e6e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: students2Assign.length > 0 ? 'not-allowed' : 'pointer',
                        fontWeight: '700'
                      }}
                    >
                      저장하기
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* 현황 보기 탭 */}
      {tab === 'view' && (
        <div className="sgm-card">
          <h3>조 편성 현황</h3>
          {selectedClass && classGroups ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label>
                  반 선택:{' '}
                  <select
                    value={selectedClass || ''}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    {Object.keys(classGroups).length > 0 && Object.keys(classGroups).map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {Object.entries(classGroups).map(([groupName, groupData]) => (
                  <div key={groupName} style={{
                    background: '#fafafa',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e4e1da'
                  }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#232f52' }}>
                      {groupName}
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      {groupData.members?.map(member => (
                        <li key={member.id} style={{ marginBottom: '6px' }}>
                          {member.name}
                          {groupData.leader === member.id ? ' 👑' : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#999' }}>저장된 조 편성이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default StudentGroupManagement
