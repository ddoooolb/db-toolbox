import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { initialGroupsData } from '../../data/groupsData'
import './DanceReflection.css'

function DanceReflectionGrade3() {
  const selectedGrade = '3'
  const [selectedClass, setSelectedClass] = useState('1')
  const [selectedNumber, setSelectedNumber] = useState('')
  const [studentName, setStudentName] = useState('')
  const [reflections, setReflections] = useState({
    role: '',
    roleEffort: '',
    technique: '',
    teamwork: '',
    growth: '',
    overall: ''
  })
  const [isSaved, setIsSaved] = useState(false)
  const [submitMsg, setSubmitMsg] = useState({type: '', text: ''})
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [adminPassInput, setAdminPassInput] = useState('')
  const [adminPassMsg, setAdminPassMsg] = useState({type: '', text: ''})

  useEffect(() => {
    if (!selectedNumber) {
      setStudentName('')
      setReflections({
        role: '',
        roleEffort: '',
        technique: '',
        teamwork: '',
        growth: '',
        overall: ''
      })
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
  }, [selectedClass, selectedNumber])

  const loadReflection = async (grade, classNum, number) => {
    try {
      const studentId = `${grade}-${classNum}-${number}`
      const docRef = doc(db, 'teacher-comments', studentId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists() && docSnap.data().reflections) {
        setReflections(docSnap.data().reflections)
      } else {
        setReflections({
          role: '',
          roleEffort: '',
          technique: '',
          teamwork: '',
          growth: '',
          overall: ''
        })
      }
    } catch (error) {
      console.error('소감문 로드 오류:', error)
    }
  }

  const handleSaveReflection = async () => {
    if (!selectedNumber || !studentName) {
      setSubmitMsg({type: 'error', text: '학생을 선택해주세요'})
      setTimeout(() => setSubmitMsg({type: '', text: ''}), 2000)
      return
    }

    if (!Object.values(reflections).some(val => val.trim())) {
      setSubmitMsg({type: 'error', text: '최소 하나의 소감을 입력해주세요'})
      setTimeout(() => setSubmitMsg({type: '', text: ''}), 2000)
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
        reflections: reflections,
        reflectionSavedAt: new Date().toISOString().split('T')[0]
      }, { merge: true })

      setSubmitMsg({type: 'success', text: '✓ 저장되었습니다'})
      setTimeout(() => setSubmitMsg({type: '', text: ''}), 2000)

      // 저장 후 입력창 초기화
      setReflections({
        role: '',
        roleEffort: '',
        technique: '',
        teamwork: '',
        growth: '',
        overall: ''
      })
    } catch (error) {
      console.error('저장 오류:', error)
      setSubmitMsg({type: 'error', text: '저장 중 오류가 발생했습니다'})
      setTimeout(() => setSubmitMsg({type: '', text: ''}), 2000)
    }
  }

  const handleAdminLogin = async () => {
    if (!adminPassInput.trim()) {
      setAdminPassMsg({type: 'error', text: '비밀번호를 입력해주세요'})
      setTimeout(() => setAdminPassMsg({type: '', text: ''}), 2000)
      return
    }

    try {
      const docRef = doc(db, 'config', 'admin-password')
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        setAdminPassMsg({type: 'error', text: '관리자 비밀번호가 설정되지 않았습니다'})
        setTimeout(() => setAdminPassMsg({type: '', text: ''}), 2000)
        return
      }

      const correctPassword = docSnap.data().password

      if (adminPassInput === correctPassword) {
        setIsAdminMode(true)
        setAdminPassMsg({type: 'success', text: '관리자 모드 활성화'})
        setAdminPassInput('')
        setTimeout(() => setAdminPassMsg({type: '', text: ''}), 1500)
      } else {
        setAdminPassMsg({type: 'error', text: '비밀번호가 틀렸습니다'})
        setTimeout(() => setAdminPassMsg({type: '', text: ''}), 2000)
        setAdminPassInput('')
      }
    } catch (error) {
      console.error('관리자 검증 오류:', error)
      setAdminPassMsg({type: 'error', text: '오류가 발생했습니다'})
      setTimeout(() => setAdminPassMsg({type: '', text: ''}), 2000)
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>3학년 댄스 소감문</h2>
        {!isAdminMode && (
          <button
            onClick={() => setIsAdminMode(true)}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            🔐 관리자
          </button>
        )}
      </div>

      {isAdminMode && !selectedNumber && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #6c757d'
        }}>
          <h3 style={{ marginTop: 0, color: '#1a2332' }}>관리자 모드</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="password"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="비밀번호 입력"
              style={{
                padding: '10px',
                border: '2px solid #e8ecf1',
                borderRadius: '6px',
                fontSize: '14px',
                flex: 1
              }}
            />
            <button
              onClick={handleAdminLogin}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              로그인
            </button>
            <button
              onClick={() => setIsAdminMode(false)}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              닫기
            </button>
          </div>
          {adminPassMsg.text && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                borderRadius: '4px',
                background: adminPassMsg.type === 'success' ? '#d4edda' : '#f8d7da',
                color: adminPassMsg.type === 'success' ? '#155724' : '#721c24',
                fontSize: '13px'
              }}
            >
              {adminPassMsg.text}
            </div>
          )}
        </div>
      )}

      {isAdminMode && selectedNumber && (
        <div style={{
          background: '#fff3cd',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '13px',
          color: '#856404',
          fontWeight: '600'
        }}>
          ✓ 관리자 모드 활성화 중
        </div>
      )}

      {submitMsg.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '15px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '600',
            background: submitMsg.type === 'success' ? '#d4edda' : '#f8d7da',
            color: submitMsg.type === 'success' ? '#155724' : '#721c24'
          }}
        >
          {submitMsg.text}
        </div>
      )}

      <div className="selection-area">
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

          <div className="reflection-questions">
            <div className="question-group">
              <label>1️⃣ 【역할】이번 안무에서 너의 역할은 뭐였어?</label>
              <textarea
                value={reflections.role}
                onChange={(e) => setReflections({...reflections, role: e.target.value})}
                placeholder="예: 팀의 리더로써, 센터 포지션에서..."
                rows={3}
              />
            </div>

            <div className="question-group">
              <label>2️⃣ 【역할 수행】그 역할을 잘 수행하기 위해 뭘 노력했어?</label>
              <textarea
                value={reflections.roleEffort}
                onChange={(e) => setReflections({...reflections, roleEffort: e.target.value})}
                placeholder="예: 팀원들을 챙기고, 동작을 정확하게 연습하고..."
                rows={3}
              />
            </div>

            <div className="question-group">
              <label>3️⃣ 【기술】기술이나 동작 면에서 가장 어려웠던 부분은?</label>
              <textarea
                value={reflections.technique}
                onChange={(e) => setReflections({...reflections, technique: e.target.value})}
                placeholder="예: 복잡한 스텝, 리듬 맞추기, 표현력..."
                rows={3}
              />
            </div>

            <div className="question-group">
              <label>4️⃣ 【팀협력】팀원들과 함께 움직일 때 어떤 경험을 했어?</label>
              <textarea
                value={reflections.teamwork}
                onChange={(e) => setReflections({...reflections, teamwork: e.target.value})}
                placeholder="예: 서로 도와주고, 호흡을 맞추고, 함께 성장하고..."
                rows={3}
              />
            </div>

            <div className="question-group">
              <label>5️⃣ 【성장】이 활동을 통해 배우거나 발전한 점은?</label>
              <textarea
                value={reflections.growth}
                onChange={(e) => setReflections({...reflections, growth: e.target.value})}
                placeholder="예: 표현력이 좋아졌고, 팀워크의 중요성을 알았고..."
                rows={3}
              />
            </div>

            <div className="question-group">
              <label>6️⃣ 【총평】이번 수업 전체에 대한 자유로운 소감이나 기타 느낀 점은?</label>
              <textarea
                value={reflections.overall}
                onChange={(e) => setReflections({...reflections, overall: e.target.value})}
                placeholder="예: 재미있었어, 힘들었지만 보람있었어, 다음에 더 잘하고 싶어..."
                rows={3}
              />
            </div>
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

export default DanceReflectionGrade3
