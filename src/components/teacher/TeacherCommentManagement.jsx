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
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedComment, setGeneratedComment] = useState('')
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

  const handleSaveGeneratedComment = async () => {
    if (!selectedStudent) {
      alert('학생을 선택해주세요')
      return
    }

    if (!generatedComment.trim()) {
      alert('생기부 내용을 입력해주세요')
      return
    }

    try {
      const recordId = selectedStudent.id
      const docRef = doc(db, 'teacher-comments', recordId)

      await setDoc(docRef, {
        ...records[recordId],
        generatedComment: generatedComment,
        commentSavedAt: new Date().toISOString().split('T')[0]
      }, { merge: true })

      alert('생기부가 저장되었습니다')
      setGeneratedComment('')
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="teacher-comment-management">
      <h2>교과세특 관리</h2>

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
            <h4>누적 기록</h4>
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

          <div className="form-group">
            <label>생기부 입력 (Claude.ai에서 생성한 텍스트)</label>
            <textarea
              value={generatedComment}
              onChange={(e) => setGeneratedComment(e.target.value)}
              placeholder="Claude.ai에서 생성한 생기부 내용을 붙여넣으세요"
              rows={6}
            />
          </div>

          <button
            className="btn-generate"
            onClick={handleSaveGeneratedComment}
          >
            생기부 저장
          </button>
        </div>
      )}
    </div>
  )
}

export default TeacherCommentManagement
