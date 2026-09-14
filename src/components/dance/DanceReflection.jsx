import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { initialGroupsData } from '../../data/groupsData'
import './DanceReflection.css'

function DanceReflection() {
  const [selectedGrade, setSelectedGrade] = useState('1')
  const [selectedClass, setSelectedClass] = useState('1')
  const [selectedNumber, setSelectedNumber] = useState('')
  const [studentName, setStudentName] = useState('')
  const [reflection, setReflection] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (!selectedNumber) {
      setStudentName('')
      setReflection('')
      return
    }

    const classKey = `${selectedGrade}학년 ${selectedClass}반`
    const classData = initialGroupsData[classKey]

    if (!classData) {
      setStudentName('')
      return
    }

    let foundName = ''
    Object.entries(classData).forEach(([groupName, groupData]) => {
      groupData.members?.forEach(member => {
        if (String(member.number) === String(selectedNumber)) {
          foundName = member.name
        }
      })
    })

    setStudentName(foundName)

    if (foundName) {
      loadReflection(selectedGrade, selectedClass, selectedNumber)
    }
  }, [selectedGrade, selectedClass, selectedNumber])

  const loadReflection = async (grade, classNum, number) => {
    try {
      const studentId = `${grade}-${classNum}-${number}`
      const docRef = doc(db, 'teacher-comments', studentId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists() && docSnap.data().reflection) {
        setReflection(docSnap.data().reflection)
      } else {
        setReflection('')
      }
    } catch (error) {
      console.error('소감문 로드 오류:', error)
    }
  }

  const handleSaveReflection = async () => {
    if (!selectedNumber || !studentName) {
      alert('학생을 선택해주세요')
      return
    }

    try {
      const studentId = `${selectedGrade}-${selectedClass}-${selectedNumber}`
      const docRef = doc(db, 'teacher-comments', studentId)
      const docSnap = await getDoc(docRef)

      const existingData = docSnap.exists() ? docSnap.data() : {}

      await setDoc(docRef, {
        ...existingData,
        studentId,
        grade: selectedGrade,
        class: selectedClass,
        number: selectedNumber,
        name: studentName,
        reflection: reflection,
        reflectionSavedAt: new Date().toISOString().split('T')[0]
      }, { merge: true })

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
      alert('소감문이 저장되었습니다')
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다')
    }
  }

  const getStudentNumbers = () => {
    const classKey = `${selectedGrade}학년 ${selectedClass}반`
    const classData = initialGroupsData[classKey]

    if (!classData) return []

    const numbers = []
    Object.entries(classData).forEach(([groupName, groupData]) => {
      groupData.members?.forEach(member => {
        if (!numbers.find(n => n === member.number)) {
          numbers.push(member.number)
        }
      })
    })

    return numbers.sort((a, b) => a - b)
  }

  return (
    <div className="dance-reflection">
      <h2>댄스 수업 소감</h2>

      <div className="selection-area">
        <div className="form-group">
          <label>학년</label>
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
            {[1, 2, 3].map(g => (
              <option key={g} value={String(g)}>{g}학년</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>반</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
              <option key={c} value={String(c)}>{c}반</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>번호</label>
          <select value={selectedNumber} onChange={(e) => setSelectedNumber(e.target.value)}>
            <option value="">선택하세요</option>
            {getStudentNumbers().map(num => (
              <option key={num} value={String(num)}>{num}번</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>이름</label>
          <input type="text" value={studentName} disabled />
        </div>
      </div>

      {studentName && (
        <div className="reflection-area">
          <h3>{selectedNumber}번 {studentName}의 소감</h3>

          <div className="form-group">
            <label>이번 수업에 대한 소감과 느낀 점을 자유롭게 작성해주세요</label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="예: 이번 안무를 배우면서 느낀 점, 어려웠던 부분, 팀원과의 협력 과정 등..."
              rows={8}
            />
          </div>

          <button
            className={`btn-save ${isSaved ? 'saved' : ''}`}
            onClick={handleSaveReflection}
          >
            {isSaved ? '✓ 저장됨' : '저장'}
          </button>
        </div>
      )}
    </div>
  )
}

export default DanceReflection
