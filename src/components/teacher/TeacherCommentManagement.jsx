import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore'
import { initialGroupsData } from '../../data/groupsData'
import './TeacherCommentManagement.css'

function TeacherCommentManagement() {
  const [selectedGrade, setSelectedGrade] = useState('1')
  const [selectedClass, setSelectedClass] = useState('1')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState({})
  const [currentRecord, setCurrentRecord] = useState('')
  const [editingRecordIdx, setEditingRecordIdx] = useState(null)
  const [editingText, setEditingText] = useState('')

  // Firestore에서 교과세특 기록 실시간 로드
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'teacher-comments'),
      snapshot => {
        const commentsData = {}
        snapshot.forEach(doc => {
          commentsData[doc.id] = doc.data()
        })
        setRecords(commentsData)
      }
    )
    return () => unsubscribe()
  }, [])

  // groupsData에서 학생 명단 로드
  useEffect(() => {
    const classKey = `${selectedGrade}학년 ${selectedClass}반`
    const classData = initialGroupsData[classKey]

    if (!classData) {
      setStudents([])
      return
    }

    const loadedStudents = []

    // 모든 조의 학생들 수집
    Object.entries(classData).forEach(([groupName, groupData]) => {
      groupData.members?.forEach(member => {
        loadedStudents.push({
          id: `${selectedGrade}-${selectedClass}-${member.number}`,
          grade: selectedGrade,
          class: selectedClass,
          number: String(member.number),
          name: member.name
        })
      })
    })

    // 번호 순서대로 정렬
    loadedStudents.sort((a, b) => parseInt(a.number) - parseInt(b.number))
    setStudents(loadedStudents)
    setSelectedStudent(null)
  }, [selectedGrade, selectedClass])

  const handleAddRecord = async () => {
    if (!selectedStudent || !currentRecord.trim()) {
      alert('학생과 기록을 입력해주세요')
      return
    }

    const recordId = `${selectedStudent.id}`
    const docRef = doc(db, 'teacher-comments', recordId)

    try {
      const docSnap = await getDoc(docRef)
      let updatedRecords = []

      if (docSnap.exists()) {
        updatedRecords = docSnap.data().records || []
      }

      updatedRecords.push({
        date: new Date().toISOString().split('T')[0],
        content: currentRecord,
        timestamp: new Date()
      })

      await setDoc(docRef, {
        studentId: selectedStudent.id,
        grade: selectedStudent.grade,
        class: selectedStudent.class,
        number: selectedStudent.number,
        name: selectedStudent.name,
        records: updatedRecords
      })

      setCurrentRecord('')
      alert('기록이 저장되었습니다')
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다')
    }
  }

  const handleDeleteRecord = async (recordIdx) => {
    if (!selectedStudent) return
    if (!confirm('이 기록을 삭제하시겠습니까?')) return

    try {
      const recordId = selectedStudent.id
      const docRef = doc(db, 'teacher-comments', recordId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const updatedRecords = docSnap.data().records || []
        updatedRecords.splice(recordIdx, 1)

        await setDoc(docRef, {
          ...docSnap.data(),
          records: updatedRecords
        })

        alert('기록이 삭제되었습니다')
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  const handleEditRecord = (recordIdx) => {
    const studentData = records[selectedStudent.id]
    if (studentData?.records?.[recordIdx]) {
      setEditingRecordIdx(recordIdx)
      setEditingText(studentData.records[recordIdx].content)
    }
  }

  const handleSaveEditRecord = async (recordIdx) => {
    if (!selectedStudent) return

    try {
      const recordId = selectedStudent.id
      const docRef = doc(db, 'teacher-comments', recordId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const updatedRecords = docSnap.data().records || []
        if (updatedRecords[recordIdx]) {
          updatedRecords[recordIdx].content = editingText
          updatedRecords[recordIdx].timestamp = new Date()

          await setDoc(docRef, {
            ...docSnap.data(),
            records: updatedRecords
          })

          setEditingRecordIdx(null)
          setEditingText('')
          alert('기록이 수정되었습니다')
        }
      }
    } catch (error) {
      console.error('수정 오류:', error)
      alert('수정 중 오류가 발생했습니다')
    }
  }

  const handleExportStudentRecords = () => {
    if (!selectedStudent) {
      alert('학생을 선택해주세요')
      return
    }

    const studentData = records[selectedStudent.id]
    if (!studentData?.records || studentData.records.length === 0) {
      alert('기록이 없습니다')
      return
    }

    let exportText = `[${selectedStudent.grade}학년 ${selectedStudent.class}반 ${selectedStudent.number}번 ${selectedStudent.name}]\n\n`

    exportText += '누가기록:\n'
    studentData.records.forEach(record => {
      exportText += `- ${record.date}: ${record.content}\n`
    })

    if (studentData.reflections) {
      exportText += `\n소감문:\n`
      if (studentData.reflections.role) exportText += `- 역할: ${studentData.reflections.role}\n`
      if (studentData.reflections.roleEffort) exportText += `- 역할 수행: ${studentData.reflections.roleEffort}\n`
      if (studentData.reflections.technique) exportText += `- 기술: ${studentData.reflections.technique}\n`
      if (studentData.reflections.teamwork) exportText += `- 팀협력: ${studentData.reflections.teamwork}\n`
      if (studentData.reflections.growth) exportText += `- 성장: ${studentData.reflections.growth}\n`
      if (studentData.reflections.overall) exportText += `- 총평: ${studentData.reflections.overall}\n`
    }

    navigator.clipboard.writeText(exportText)
    alert('클립보드에 복사되었습니다!\nClaude.ai에 붙여넣으세요.')
  }

  const handleExportClassRecords = () => {
    if (!students || students.length === 0) {
      alert('학생이 없습니다')
      return
    }

    let classRecords = `【${selectedGrade}학년 ${selectedClass}반】\n\n`
    let hasRecords = false

    students.forEach(student => {
      const studentData = records[student.id]
      const hasRecords = studentData?.records && studentData.records.length > 0
      const hasReflections = studentData?.reflections && Object.values(studentData.reflections).some(val => val?.trim())

      if (hasRecords || hasReflections) {
        hasRecords && (hasRecords = true)
        classRecords += `[${student.number}번 ${student.name}]\n`

        if (hasRecords) {
          classRecords += '누가기록:\n'
          studentData.records.forEach(record => {
            classRecords += `- ${record.date}: ${record.content}\n`
          })
        }

        if (hasReflections) {
          classRecords += `소감문:\n`
          if (studentData.reflections.role) classRecords += `  - 역할: ${studentData.reflections.role}\n`
          if (studentData.reflections.roleEffort) classRecords += `  - 역할 수행: ${studentData.reflections.roleEffort}\n`
          if (studentData.reflections.technique) classRecords += `  - 기술: ${studentData.reflections.technique}\n`
          if (studentData.reflections.teamwork) classRecords += `  - 팀협력: ${studentData.reflections.teamwork}\n`
          if (studentData.reflections.growth) classRecords += `  - 성장: ${studentData.reflections.growth}\n`
          if (studentData.reflections.overall) classRecords += `  - 총평: ${studentData.reflections.overall}\n`
        }
        classRecords += '\n'
      }
    })

    if (!hasRecords) {
      alert('기록이 없습니다')
      return
    }

    navigator.clipboard.writeText(classRecords)
    alert('클래스 전체 기록이 클립보드에 복사되었습니다!\nClaude.ai에 붙여넣으세요.')
  }

  const handleExportAllRecords = () => {
    let allRecords = `【전체 누가기록】\n\n`
    let hasRecords = false

    for (let grade = 1; grade <= 3; grade++) {
      for (let classNum = 1; classNum <= 12; classNum++) {
        const classKey = `${grade}학년 ${classNum}반`
        const classData = initialGroupsData[classKey]

        if (!classData) continue

        const classRecords = []
        Object.entries(classData).forEach(([groupName, groupData]) => {
          groupData.members?.forEach(member => {
            const studentId = `${grade}-${classNum}-${member.number}`
            const studentData = records[studentId]
            if (studentData?.records && studentData.records.length > 0) {
              classRecords.push({
                number: member.number,
                name: member.name,
                data: studentData
              })
            }
          })
        })

        if (classRecords.length > 0) {
          hasRecords = true
          allRecords += `【${grade}학년 ${classNum}반】\n`
          classRecords.sort((a, b) => a.number - b.number)
          classRecords.forEach(student => {
            const hasRecords = student.data.records && student.data.records.length > 0
            const hasReflections = student.data.reflections && Object.values(student.data.reflections).some(val => val?.trim())

            allRecords += `[${student.number}번 ${student.name}]\n`

            if (hasRecords) {
              allRecords += '누가기록:\n'
              student.data.records.forEach(record => {
                allRecords += `- ${record.date}: ${record.content}\n`
              })
            }

            if (hasReflections) {
              allRecords += `소감문:\n`
              if (student.data.reflections.role) allRecords += `  - 역할: ${student.data.reflections.role}\n`
              if (student.data.reflections.roleEffort) allRecords += `  - 역할 수행: ${student.data.reflections.roleEffort}\n`
              if (student.data.reflections.technique) allRecords += `  - 기술: ${student.data.reflections.technique}\n`
              if (student.data.reflections.teamwork) allRecords += `  - 팀협력: ${student.data.reflections.teamwork}\n`
              if (student.data.reflections.growth) allRecords += `  - 성장: ${student.data.reflections.growth}\n`
              if (student.data.reflections.overall) allRecords += `  - 총평: ${student.data.reflections.overall}\n`
            }
            allRecords += '\n'
          })
          allRecords += '\n'
        }
      }
    }

    if (!hasRecords) {
      alert('기록이 없습니다')
      return
    }

    navigator.clipboard.writeText(allRecords)
    alert('모든 반의 기록이 클립보드에 복사되었습니다!\nClaude.ai에 붙여넣으세요.')
  }

  return (
    <div className="teacher-comment-management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>교과세특 관리</h2>
        <button className="btn-export-all" onClick={handleExportAllRecords}>
          📚 모든 반 내보내기
        </button>
      </div>

      <div className="selection-area">
        <div className="form-group">
          <label>학년</label>
          <select value={selectedGrade} onChange={(e) => {
            console.log('학년 변경:', e.target.value)
            setSelectedGrade(e.target.value)
          }}>
            {[1, 2, 3].map(g => (
              <option key={g} value={String(g)}>{g}학년</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>반</label>
          <select value={selectedClass} onChange={(e) => {
            console.log('반 변경:', e.target.value)
            setSelectedClass(e.target.value)
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
              <option key={c} value={String(c)}>{c}반</option>
            ))}
          </select>
        </div>
      </div>

      <div className="student-list">
        <h3>학생 목록</h3>
        <div className="students">
          {students.map(student => (
            <button
              key={student.id}
              className={`student-btn ${selectedStudent?.id === student.id ? 'active' : ''}`}
              onClick={() => setSelectedStudent(student)}
            >
              {student.number}번 {student.name}
            </button>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <div className="record-area">
          <h3>{selectedStudent.number}번 {selectedStudent.name} 기록</h3>

          <div className="form-group">
            <label>수업 내용/단어/문구 입력</label>
            <textarea
              value={currentRecord}
              onChange={(e) => setCurrentRecord(e.target.value)}
              placeholder="예: 높이뛰기 잘함, 서브 강함, 팀협력 우수"
              rows={4}
            />
          </div>

          <button className="btn-add" onClick={handleAddRecord}>
            기록 추가
          </button>

          <div className="records-history">
            <h4>📝 누적 기록</h4>
            {records[selectedStudent.id]?.records?.map((record, idx) => (
              <div key={idx} className="record-item">
                {editingRecordIdx === idx ? (
                  <div className="record-edit">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={3}
                    />
                    <div className="edit-buttons">
                      <button
                        className="btn-save-edit"
                        onClick={() => handleSaveEditRecord(idx)}
                      >
                        저장
                      </button>
                      <button
                        className="btn-cancel-edit"
                        onClick={() => setEditingRecordIdx(null)}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="date">📅 {record.date}</span>
                    <span className="content">{record.content}</span>
                    <div className="record-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditRecord(idx)}
                      >
                        수정
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteRecord(idx)}
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            )) || <p>기록이 없습니다</p>}
          </div>

          {records[selectedStudent.id]?.reflections && (
            <div className="reflection-display">
              <h4>💭 학생 소감문</h4>
              <div className="reflection-content">
                {records[selectedStudent.id].reflections.role && (
                  <div className="reflection-item">
                    <strong>【역할】</strong> {records[selectedStudent.id].reflections.role}
                  </div>
                )}
                {records[selectedStudent.id].reflections.roleEffort && (
                  <div className="reflection-item">
                    <strong>【역할 수행】</strong> {records[selectedStudent.id].reflections.roleEffort}
                  </div>
                )}
                {records[selectedStudent.id].reflections.technique && (
                  <div className="reflection-item">
                    <strong>【기술】</strong> {records[selectedStudent.id].reflections.technique}
                  </div>
                )}
                {records[selectedStudent.id].reflections.teamwork && (
                  <div className="reflection-item">
                    <strong>【팀협력】</strong> {records[selectedStudent.id].reflections.teamwork}
                  </div>
                )}
                {records[selectedStudent.id].reflections.growth && (
                  <div className="reflection-item">
                    <strong>【성장】</strong> {records[selectedStudent.id].reflections.growth}
                  </div>
                )}
                {records[selectedStudent.id].reflections.overall && (
                  <div className="reflection-item">
                    <strong>【총평】</strong> {records[selectedStudent.id].reflections.overall}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="export-buttons">
            <button className="btn-export" onClick={handleExportStudentRecords}>
              📋 학생 기록 내보내기
            </button>
            <button className="btn-export-class" onClick={handleExportClassRecords}>
              📊 반 전체 기록 내보내기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherCommentManagement
