import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore'
import './TeacherCommentManagement.css'

function TeacherCommentManagement() {
  const [selectedGrade, setSelectedGrade] = useState('1')
  const [selectedClass, setSelectedClass] = useState('1')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState({})
  const [currentRecord, setCurrentRecord] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

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

  // 학급 선택 변경 시 학생 명단 업데이트 (임시 - 나중에 Firestore에서 로드)
  useEffect(() => {
    const mockStudents = [
      { id: `${selectedGrade}-${selectedClass}-1`, number: 1, name: '학생1', grade: selectedGrade, class: selectedClass },
      { id: `${selectedGrade}-${selectedClass}-2`, number: 2, name: '학생2', grade: selectedGrade, class: selectedClass },
      { id: `${selectedGrade}-${selectedClass}-3`, number: 3, name: '학생3', grade: selectedGrade, class: selectedClass },
    ]
    setStudents(mockStudents)
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

  const handleGenerateComment = async () => {
    if (!selectedStudent) {
      alert('학생을 선택해주세요')
      return
    }

    setIsGenerating(true)
    try {
      const studentData = records[selectedStudent.id]
      if (!studentData || !studentData.records || studentData.records.length === 0) {
        alert('기록이 없습니다')
        return
      }

      // Claude API 호출 (임시)
      alert('교과세특 생성 기능은 개발 중입니다')
    } catch (error) {
      console.error('생성 오류:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="teacher-comment-management">
      <h2>교과세특 관리</h2>

      <div className="selection-area">
        <div className="form-group">
          <label>학년</label>
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
            {[1, 2, 3].map(g => (
              <option key={g} value={g}>{g}학년</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>반</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
              <option key={c} value={c}>{c}반</option>
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
                <span className="date">{record.date}</span>
                <span className="content">{record.content}</span>
              </div>
            )) || <p>기록이 없습니다</p>}
          </div>

          <button
            className="btn-generate"
            onClick={handleGenerateComment}
            disabled={isGenerating}
          >
            {isGenerating ? '생성 중...' : '교과세특 생성'}
          </button>
        </div>
      )}
    </div>
  )
}

export default TeacherCommentManagement
