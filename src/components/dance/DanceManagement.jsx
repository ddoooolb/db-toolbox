import { useState, useEffect, Fragment } from 'react'
import StudentGroupManagement from '../admin/StudentGroupManagement'
import { getDanceData, setDanceData } from '../../firestore-utils'
import './dance-styles.css'

const keyFor = (name, classId) => `dance-eval-${name}:${classId}`

const RESULT_RUBRIC = [
  {score:20, text:"동작·박자·대형이 정확하고 무대에서 자신 있게 표현하여 완성도가 높음"},
  {score:18, text:"동작·박자·대형이 대체로 정확하여 완성도가 양호함"},
  {score:16, text:"동작·박자·대형이 무난하게 맞아 완성도가 보통 수준임"},
  {score:14, text:"동작·박자·대형에서 실수가 다소 있어 완성도가 미흡함"},
  {score:12, text:"동작·박자·대형에서 실수가 잦아 완성도가 부족함"},
  {score:10, text:"동작·박자·대형이 자주 어긋나 완성도가 낮음"},
  {score:8,  text:"동작 대부분이 맞지 않거나 대형이 거의 유지되지 않아 완성도가 매우 낮음(최저점)"}
]

const FLAG_LABEL = { flat:'전원 동일 점수', bias:'전반적 편향', outlier:'큰 점수 차이' }

const STUDENT_NUMBERS = {
  "공예준": "01", "곽준영": "02", "권태희": "03", "김도율": "02", "김동하": "05", "김민서": "07",
  "김소연": "05", "김윤서": "08", "김이한": "09", "김지후": "10", "김태훈": "11", "노윤아": "12",
  "박제현": "13", "서태훈": "14", "석다윤": "15", "엄지율": "16", "오준석": "17", "우찬우": "18",
  "유동균": "19", "윤서현": "20", "이윤건": "21", "전지은": "22", "정우진": "23", "제하윤": "24",
  "조수아": "25", "채가연": "26", "한범희": "27", "함의진": "28", "황혜인": "29", "이승민": "30",
  "고영빈": "01", "권오현": "02", "김산": "04", "김시윤": "06", "김준서": "07", "김준희": "08",
  "박가은": "09", "박상민": "10", "양지윤": "11", "이다예": "12", "이준우": "14", "이치환": "14",
  "이하율": "15", "임규훈": "16", "임종우": "17", "임지산": "18", "임효재": "19", "장민규": "20",
  "장지민": "21", "전지민": "22", "조은서": "23", "최다민": "24", "최승준": "25", "최예슬": "26",
  "최현중": "27", "홍라희": "28", "홍수빈": "29", "조재형": "30", "강민재": "01", "강지호": "02",
  "고연우": "03", "곽윤서": "04", "김기홍": "05", "김동준": "06", "김성은": "08", "김유희": "09",
  "김정윤": "10", "김지윤": "11", "노연희": "12", "박서령": "13", "박지훈": "14", "신다혜": "15",
  "신호준": "16", "이도영": "17", "이수현": "18", "이예준": "19", "이현서": "21", "임서준": "22",
  "정시연": "23", "정우영": "24", "정우혁": "25", "지유림": "26", "진수현": "27", "최성열": "28",
  "최윤": "29", "한정은": "30", "홍현성": "31", "강수인": "01", "고윤아": "02", "권푸른": "03",
  "김가온": "04", "김가윤": "05", "김지수": "06", "노기현": "07", "박토마스": "08", "성지민": "09",
  "손예담": "10", "송아민": "11", "신우주": "12", "신유빈": "13", "안서현": "14", "양유미": "15",
  "윤다미": "16", "윤태양": "17", "이규빈": "18", "이로하": "19", "이승빈": "20", "이재호": "21",
  "이주아": "22", "이태양": "23", "이해찬솔": "24", "이효진": "25", "임서율": "26", "장하율": "27",
  "전유민": "28", "조원빈": "29", "최시온": "30", "홍석찬": "31", "김규빈": "01", "김단풍": "02",
  "김동완": "03", "김라희": "04", "김문성": "05", "김민주": "06", "김수연": "07", "김태린": "08",
  "박민재": "09", "박연서": "10", "변지후": "11", "심지환": "12", "양서후": "13", "유석현": "14",
  "유시연": "15", "윤다니엘": "16", "윤서우": "17", "이도현": "18", "이성현": "19", "이예빈": "20",
  "이주원": "21", "이찬슬": "22", "임하은": "23", "전나윤": "24", "조우진": "25", "최민영": "26",
  "최이준": "27", "한소희": "28", "한정희": "29", "홍수정": "30", "김로라": "31", "권희현": "01",
  "김나윤": "02", "김보경": "03", "김주연": "04", "문지훈": "05", "민영원": "06", "박시윤": "16",
  "박예은": "08", "박하온": "09", "박헌서": "10", "양하윤": "11", "오승연": "12", "이정민": "13",
  "이준혁": "15", "이태헌": "16", "이한결": "17", "이현성": "18", "이효림": "19", "이후승": "20",
  "장시아": "21", "정승원": "22", "정시영": "23", "정시우": "24", "조명제": "25", "조승빈": "26",
  "조윤겸": "27", "조은찬": "28", "채유리": "29", "최예령": "30", "최준영": "31", "강두희": "01",
  "강아인": "02", "강한휘": "03", "고건호": "04", "구예성": "05", "김도희": "06", "김동희": "07",
  "김래현": "08", "김민상": "09", "김지아": "10", "김지연": "11", "김현진": "12", "박가을": "13",
  "박서정": "14", "박서하": "15", "박은서": "17", "서지우": "18", "양서빈": "19", "원태준": "20",
  "이도윤": "21", "이연우": "22", "이윤찬": "23", "이채빈": "24", "장민기": "25", "전강현": "26",
  "조예정": "27", "조유현": "28", "최예성": "29", "한상현": "30", "한예성": "31", "강윤식": "01",
  "구현우": "02", "김도현": "03", "김민솔": "04", "김범찬": "05", "김아린": "06", "김하원": "07",
  "김하준": "08", "문서영": "09", "문수민": "10", "박시율": "12", "박지율": "13", "박한이": "14",
  "변정연": "15", "송시현": "16", "안나경": "17", "안도현": "18", "안지우": "19", "엄서율": "20",
  "이원": "21", "이하늘": "22", "장유림": "23", "정민건": "24", "정민우": "25", "정시아": "26",
  "조아름": "27", "최지온": "28", "최희연": "29", "한재희": "30", "현지원": "31", "김규린": "01",
  "김서우": "03", "김수인": "04", "김은비": "05", "김정민": "06", "김주아": "07", "김주원": "08",
  "김지섭": "09", "민사랑": "10", "박준휘": "12", "서여준": "13", "손은율": "14", "신예린": "15",
  "엄정식": "16", "이가은": "17", "이래현": "18", "이재준": "19", "이하영": "20", "전도우": "21",
  "전소율": "22", "정연우": "23", "정진우": "24", "정혜인": "25", "주민서": "26", "차유찬": "27",
  "최영우": "28", "한연지": "29", "한재완": "30", "구승현": "01", "권다현": "02", "권서은": "03",
  "김근후": "04", "김동규": "05", "김서준": "06", "김선율": "07", "김연진": "08", "김원형": "09",
  "김지민": "05", "김지우": "11", "김태우": "12", "남건우": "14", "박가현": "15", "박지민": "16",
  "박하라": "17", "서보리": "18", "안시우": "19", "양다솜": "20", "윤은서": "21", "이유민": "22",
  "이지민": "23", "이현수": "25", "임용우": "26", "장서윤": "27", "장율건": "28", "정이찬": "29",
  "최효은": "30", "황수아": "31", "권승현": "01", "김유주": "04", "김재우": "05", "김태은": "06",
  "김효람": "08", "문서준": "09", "박정연": "11", "박지효": "12", "심서율": "13", "안지용": "14",
  "양희진": "15", "엄민하": "16", "오민준": "17", "이다연": "18", "이동현": "19", "이소율": "20",
  "이주혁": "21", "이지우": "22", "전시현": "24", "정서율": "25", "정아인": "26", "정유준": "27",
  "정환룡": "28", "최민솔": "29", "홍태윤": "30", "황준서": "31", "김채원": "32", "고예준": "01",
  "김대환": "02", "김도윤": "03", "김세율": "04", "김채윤": "06", "김현우": "07", "문세라": "08",
  "문시아": "09", "민선후": "10", "박승아": "11", "박용윤": "12", "서한별": "13", "안시온": "14",
  "우다영": "15", "이소명": "16", "이윤아": "17", "이정찬": "18", "이채민": "19", "이채웅": "20",
  "이효린": "21", "임서진": "22", "전경훈": "23", "정예율": "24", "정하은": "25", "조설리": "26",
  "최민호": "27", "최은우": "28", "한도윤": "29", "황레이나": "30", "황성일": "31"
}

const bandProcess = (avg) => {
  if (avg === null || avg === undefined) return null
  if (avg > 18) return 20
  if (avg > 16) return 18
  if (avg > 14) return 16
  if (avg > 12) return 14
  if (avg > 10) return 12
  if (avg > 8) return 10
  return 8
}

function DanceManagement() {
  const [tab, setTab] = useState('evaluation')
  const [classes, setClasses] = useState({})
  const [selectedClass, setSelectedClass] = useState(null)
  const [openState, setOpenState] = useState({})
  const [records, setRecords] = useState({})
  const [submitted, setSubmitted] = useState({})
  const [teacherResults, setTeacherResults] = useState({})
  const [overrides, setOverrides] = useState({})
  const [resultOverrides, setResultOverrides] = useState({})
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [resultModalStudent, setResultModalStudent] = useState(null)
  const [resultModalValue, setResultModalValue] = useState(0)

  useEffect(() => {
    const groupsData = JSON.parse(localStorage.getItem('groups-data') || '{}')
    const builtClasses = {}
    Object.entries(groupsData).forEach(([classId, classGroups]) => {
      builtClasses[classId] = {
        label: classId,
        groups: {},
        leaders: {}
      }
      Object.entries(classGroups).forEach(([groupName, groupData]) => {
        // 중복 제거
        const memberNames = [...new Set(groupData.members.map(m => m.name))]
        // 조장도 조원 목록에 포함
        if (groupData.leader && !memberNames.includes(groupData.leader)) {
          memberNames.push(groupData.leader)
        }
        builtClasses[classId].groups[groupName] = memberNames
        if (groupData.leader) {
          builtClasses[classId].leaders[groupName] = groupData.leader
        }
      })
    })
    setClasses(builtClasses)
    const firstClass = Object.keys(builtClasses)[0]
    if (firstClass && !selectedClass) setSelectedClass(firstClass)
  }, [])

  const classData = classes[selectedClass]
  const groups = classData?.groups || {}
  const leaders = classData?.leaders || {}

  // 데이터 로드
  useEffect(() => {
    if (selectedClass) {
      loadData()
    }
  }, [selectedClass])

  const loadData = async () => {
    setLoading(true)
    try {
      const [openStateData, recordsData, submittedData, teacherResultsData, overridesData, resultOverridesData] = await Promise.all([
        getDanceData('open', selectedClass),
        getDanceData('records', selectedClass),
        getDanceData('submitted', selectedClass),
        getDanceData('teacher-result', selectedClass),
        getDanceData('overrides', selectedClass),
        getDanceData('result-overrides', selectedClass)
      ])

      setOpenState(openStateData)
      setRecords(recordsData)
      setSubmitted(submittedData)
      setTeacherResults(teacherResultsData)
      setOverrides(overridesData)
      setResultOverrides(resultOverridesData)

      detectFlags(recordsData)
    } catch (e) {
      console.error('데이터 로드 실패:', e)
    } finally {
      setLoading(false)
    }
  }

  // 신뢰도 점검
  const detectFlags = (recordsData) => {
    const flagList = []
    const byRater = {}
    const byTarget = {}

    Object.entries(recordsData).forEach(([key, r]) => {
      const raterKey = r.evalType + '|' + r.raterName
      byRater[raterKey] = byRater[raterKey] || []
      byRater[raterKey].push({key, ...r})

      const targetKey = r.evalType + '|' + r.target
      byTarget[targetKey] = byTarget[targetKey] || []
      byTarget[targetKey].push({key, ...r})
    })

    // 1. 전원 동일 점수
    Object.entries(byRater).forEach(([rKey, recs]) => {
      if (recs.length >= 2 && recs.every(r => r.score === recs[0].score)) {
        flagList.push({
          type: 'flat',
          title: `${recs[0].raterName} (${recs[0].evalType}) — 평가 대상 ${recs.length}명 전원에게 ${recs[0].score}점`,
          keys: recs.map(r => r.key)
        })
      }
    })

    // 2. 전반적 편향 (기준: 4점 이상)
    Object.entries(byRater).forEach(([rKey, recs]) => {
      const evalType = recs[0].evalType
      const allSameType = Object.values(recordsData).filter(r => r.evalType === evalType)
      if (allSameType.length === 0) return
      const overallAvg = allSameType.reduce((a, r) => a + r.score, 0) / allSameType.length
      const raterAvg = recs.reduce((a, r) => a + r.score, 0) / recs.length
      if (Math.abs(raterAvg - overallAvg) >= 5) {
        flagList.push({
          type: 'bias',
          title: `${recs[0].raterName} (${evalType}) — 평균 ${raterAvg.toFixed(1)}점 (전체 평균 ${overallAvg.toFixed(1)}점 대비 ${raterAvg > overallAvg ? '후하게' : '박하게'})`,
          keys: recs.map(r => r.key)
        })
      }
    })

    // 3. 큰 점수 차이 (기준: 8점 이상)
    Object.values(byTarget).forEach(recs => {
      if (recs.length < 2) return
      recs.forEach(r => {
        const others = recs.filter(o => o.key !== r.key)
        const othersAvg = others.reduce((a, o) => a + o.score, 0) / others.length
        if (Math.abs(r.score - othersAvg) >= 8) {
          flagList.push({
            type: 'outlier',
            title: `${r.raterName} → ${r.target} (${r.evalType}) — ${r.score}점 (다른 평가자 평균 ${othersAvg.toFixed(1)}점)`,
            keys: [r.key]
          })
        }
      })
    })

    setFlags(flagList)
  }

  // 평가 열기/닫기
  const toggleOpen = (type) => {
    const newState = {...openState}
    newState[type] = !newState[type]
    setOpenState(newState)
    setDanceData('open', selectedClass, newState)
  }

  // 제출 다시 허용
  const resetSubmitted = (key) => {
    if (!window.confirm('이 제출을 취소하시겠습니까?\n\n관련된 평가 데이터도 모두 삭제됩니다.')) {
      return
    }

    const [evalType, name] = key.split('|')

    // submitted 삭제
    const newSubmitted = {...submitted}
    delete newSubmitted[key]
    setSubmitted(newSubmitted)
    setDanceData('submitted', selectedClass, newSubmitted)

    // 해당 학생의 평가 기록 삭제
    const newRecords = {...records}
    const keysToDelete = Object.keys(newRecords).filter(k => {
      const record = newRecords[k]
      return record.evalType === evalType && record.raterName === name
    })
    keysToDelete.forEach(k => delete newRecords[k])
    setRecords(newRecords)
    setDanceData('records', selectedClass, newRecords)

    // 신뢰도 점검 재계산
    detectFlags(newRecords)

    // 전체 데이터 다시 로드
    loadData()
  }

  // Flag 토글
  const toggleFlag = (flagIndex) => {
    const flagData = flags[flagIndex]
    if (!flagData) return

    const newRecords = {...records}
    flagData.keys.forEach(k => {
      if (newRecords[k]) {
        newRecords[k].excluded = !newRecords[k].excluded
      }
    })
    setRecords(newRecords)
    setDanceData('records', selectedClass, newRecords)
    loadData()
  }

  // 결과평가 설정 (같은 버튼 다시 누르면 해제)
  const setResultScore = (group, score) => {
    const newResults = {...teacherResults}
    if (newResults[group] === score) {
      delete newResults[group]
    } else {
      newResults[group] = score
    }
    setTeacherResults(newResults)
    setDanceData('teacher-result', selectedClass, newResults)
  }

  // 오버라이드 입력
  const setOverride = (name, value) => {
    const newOverrides = {...overrides}
    if (value === '') {
      delete newOverrides[name]
    } else {
      newOverrides[name] = Number(value)
    }
    setOverrides(newOverrides)
    setDanceData('overrides', selectedClass, newOverrides)
  }

  // 테스트 데이터 생성
  const generateTestData = () => {
    const baseClassId = selectedClass  // 원본 반
    const testClassId = '3학년 1반(테스트모드)'  // 고정 이름 (매번 같음)
    const classGroups = classes[baseClassId]  // 원본 데이터에서 읽기

    if (!classGroups) {
      alert(`${baseClassId} 데이터를 찾을 수 없습니다.`)
      return
    }

    const testRecords = {}
    const testSubmitted = {}
    const allScores = [8, 10, 12, 14, 16, 18, 20]

    // 각 조마다 1차, 2차 평가 생성
    Object.entries(classGroups.groups).forEach(([groupName, memberNames], groupIdx) => {
      ['round1', 'round2'].forEach((evalType, typeIdx) => {
        memberNames.forEach((raterName, raterIdx) => {
          memberNames.forEach((targetName, targetIdx) => {
            if (raterName !== targetName) {
              const key = `${evalType}|${raterName}|${targetName}`
              let score = 16  // 기본값

              // 각 평가자가 대상별로 다른 점수를 주되, 특정 경우만 문제 만들기
              const baseScores = [12, 14, 16, 18]  // 기본 점수 풀

              if (typeIdx === 0) {
                // === 1차 평가 ===
                if (groupIdx === 0 && raterIdx === 0) {
                  // 1조 첫 평가자(채가연): 18, 16 골고루
                  score = targetIdx % 2 === 0 ? 18 : 16
                } else if (groupIdx === 2 && raterIdx === 0) {
                  // 3조 첫 평가자만: 20점(모든 대상) → 편향-후하게 1개
                  score = 20
                } else if (groupIdx === 2) {
                  // 3조 나머지: 모두 낮게 [8, 10, 12, 14] → 편향 유도
                  score = [8, 10, 12, 14][(targetIdx + raterIdx) % 4]
                } else if (groupIdx === 4 && targetIdx === memberNames.length - 1) {
                  // 5조 마지막 대상: 첫 평가자 10점, 나머지 18점 → 큰 점수차이 1개
                  score = raterIdx === 0 ? 10 : 18
                } else {
                  // 나머지 모두: 대상별로 다양하게 (평가자+대상 기반)
                  score = baseScores[(targetIdx + raterIdx * 2) % 4]
                }
              } else {
                // === 2차 평가 ===
                if (groupIdx === 1 && raterIdx === 0) {
                  // 2조 첫 평가자(석다윤): 18, 16 골고루
                  score = targetIdx % 2 === 0 ? 18 : 16
                } else if (groupIdx === 3 && raterIdx === 0) {
                  // 4조 첫 평가자만: 10점(모든 대상) → 편향-박하게 1개
                  score = 10
                } else if (groupIdx === 3 && raterIdx > 0 && targetIdx === memberNames.length - 1) {
                  // 4조 나머지: 마지막 대상만 20점 (편향을 위해)
                  score = 20
                } else if (groupIdx === 5 && targetIdx === memberNames.length - 1) {
                  // 6조 마지막 대상: 첫 평가자 10점, 나머지 18점 → 큰 점수차이 1개
                  score = raterIdx === 0 ? 10 : 18
                } else {
                  // 나머지 모두: 대상별로 다양하게 (평가자+대상 기반)
                  score = baseScores[(targetIdx + raterIdx * 2) % 4]
                }
              }

              testRecords[key] = {
                evalType,
                raterGroup: groupName,
                raterName,
                target: targetName,
                score,
                ts: Date.now()
              }
            }
          })
          testSubmitted[`${evalType}|${raterName}`] = true
        })
      })
    })

    // 결과평가: 기존 데이터가 있으면 유지, 없으면 새로 생성
    const existingResults = JSON.parse(localStorage.getItem(keyFor('teacher-result', testClassId)) || '{}')
    const testResults = {}
    Object.keys(classGroups.groups).forEach((groupName) => {
      testResults[groupName] = existingResults[groupName] || allScores[Math.floor(Math.random() * allScores.length)]
    })

    // Firestore 저장
    setDanceData('records', testClassId, testRecords)
    setDanceData('submitted', testClassId, testSubmitted)
    setDanceData('teacher-result', testClassId, testResults)
    setDanceData('open', testClassId, { round1: true, round2: true })

    // classes에도 추가 (반 선택 시 인식 가능하게)
    const newClasses = {...classes, [testClassId]: {...classGroups, label: testClassId}}
    setClasses(newClasses)

    // 다음 렌더링에서 selectedClass 변경 (classes 업데이트 후)
    Promise.resolve().then(() => {
      setSelectedClass(testClassId)
    })

    alert('✅ 테스트 데이터가 생성되었습니다!')
  }

  // 점수 계산
  const avgReceived = (evalType, target) => {
    const vals = Object.values(records)
      .filter(r => r.evalType === evalType && r.target === target && !r.excluded)
      .map(r => r.score)
    if (vals.length === 0) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  // 제외 전 점수 (모든 평가 포함)
  const avgReceivedAll = (evalType, target) => {
    const vals = Object.values(records)
      .filter(r => r.evalType === evalType && r.target === target)
      .map(r => r.score)
    if (vals.length === 0) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  // 점수 변화
  const getScoreChange = (evalType, target) => {
    const before = avgReceivedAll(evalType, target)
    const after = avgReceived(evalType, target)
    if (before === null || after === null) return null
    const change = after - before
    return change === 0 ? null : change
  }

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>로드 중...</div>

  const submittedList = Object.keys(groups).sort().flatMap(group => {
    const members = groups[group]
    return ['round1', 'round2'].flatMap(evalType =>
      members
        .filter(name => submitted[`${evalType}|${name}`])
        .map(name => `${evalType}|${name}`)
    )
  })

  return (
    <>
      <nav style={{
        display: 'flex',
        gap: '8px',
        padding: '14px 20px',
        background: '#fff',
        borderBottom: '1px solid var(--line)'
      }}>
        <button
          onClick={() => setTab('evaluation')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: tab === 'evaluation' ? '#fff2ee' : '#fff',
            color: tab === 'evaluation' ? 'var(--coral-deep)' : 'var(--navy-soft)',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '13.5px',
            borderBottom: tab === 'evaluation' ? '3px solid var(--coral)' : 'none'
          }}
        >
          평가 관리
        </button>
        <button
          onClick={() => setTab('students')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: tab === 'students' ? '#fff2ee' : '#fff',
            color: tab === 'students' ? 'var(--coral-deep)' : 'var(--navy-soft)',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '13.5px',
            borderBottom: tab === 'students' ? '3px solid var(--coral)' : 'none'
          }}
        >
          학생/조 관리
        </button>
      </nav>

      {tab === 'evaluation' && (
      <div className="dance-wrap" style={{ padding: '20px' }}>
        <h2 style={{ margin: 0, marginBottom: '20px' }}>댄스 평가 관리</h2>

        <select
          className="dance-select"
          value={selectedClass || ''}
          onChange={(e) => {
            if (e.target.value === '__test__') {
              if (window.confirm('테스트 데이터를 생성하시겠습니까?')) {
                generateTestData()
              }
            } else {
              setSelectedClass(e.target.value)
            }
          }}
          style={{ marginBottom: '20px' }}
        >
          <option value="">반을 선택하세요</option>
          {Object.entries(classes).map(([id, data]) => (
            <option key={id} value={id}>{data.label}</option>
          ))}
          <option value="__test__" style={{ background: '#f0f7ff', fontWeight: '700' }}>📊 테스트 모드 (3학년 1반 샘플)</option>
        </select>

      {/* 평가 열기/닫기 */}
      <div className="dance-card">
        <div className="dance-step-label">평가 열기/닫기</div>
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <button
            className="dance-submit-btn"
            onClick={() => toggleOpen('round1')}
            style={{ background: openState.round1 ? 'var(--ok)' : 'var(--coral)' }}
          >
            {openState.round1 ? '✓ 1차 진행 중 (닫기)' : '1차 평가 열기'}
          </button>
          <button
            className="dance-submit-btn"
            onClick={() => toggleOpen('round2')}
            style={{ background: openState.round2 ? 'var(--ok)' : 'var(--coral)' }}
          >
            {openState.round2 ? '✓ 2차 진행 중 (닫기)' : '2차 평가 열기'}
          </button>
        </div>
      </div>

      {/* 제출 현황 */}
      <div className="dance-card">
        <div className="dance-step-label">제출 현황</div>
        {submittedList.length === 0 ? (
          <div style={{ color: 'var(--mute)', fontSize: '13px' }}>아직 제출한 학생이 없어요.</div>
        ) : (
          Object.keys(groups).sort().map(group => (
            <div key={group}>
              <div style={{ background: '#f5f5f5', fontWeight: '600', padding: '10px 12px', borderTop: '2px solid var(--navy)', fontSize: '13px' }}>
                {group}
              </div>
              {groups[group].map(name => (
                ['round1', 'round2'].map(evalType => {
                  const key = `${evalType}|${name}`
                  const isSubmitted = submitted[key]
                  return (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--line)', alignItems: 'center', fontSize: '12px' }}>
                      <span>{name} — {evalType === 'round1' ? '1차' : '2차'}</span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: isSubmitted ? '#e8f5e9' : '#ffebee',
                        color: isSubmitted ? '#2f9e6e' : '#c0392b'
                      }}>
                        {isSubmitted ? '✓ 제출' : '✕ 미제출'}
                      </span>
                    </div>
                  )
                })
              ))}
            </div>
          ))
        )}
      </div>

      {/* 신뢰도 점검 */}
      {submittedList.length > 0 && (
      <div className="dance-card">
        <div className="dance-step-label">⚠ 신뢰도 점검</div>
        <div style={{ fontSize: '11px', color: '#666', background: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '12px', borderLeft: '3px solid #ff9800' }}>
          <strong>📋 신뢰도 점검 기준:</strong>
          <div style={{ marginTop: '6px', lineHeight: '1.6' }}>
            • <strong>전원 동일 점수</strong>: 한 학생이 모든 대상에게 같은 점수 부여<br/>
            • <strong>전반적 편향</strong>: 평가자의 평균점수가 전체 평균과 4점 이상 차이 (너무 높거나 낮게 평가)<br/>
            • <strong>큰 점수 차이</strong>: 특정 평가에서 다른 평가자들의 평균과 8점 이상 차이
          </div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--mute)', marginBottom: '12px' }}>
          각 이상을 확인하고 처리 상태를 선택하세요.
        </div>
        {flags.length === 0 ? (
          <div style={{ color: 'var(--mute)', fontSize: '13px' }}>✓ 현재 이상 패턴이 없습니다.</div>
        ) : (
          flags.map((flag, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '12px',
                borderBottom: '1px solid var(--line)',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      whiteSpace: 'nowrap',
                      background: flag.type === 'flat' ? '#fff2ee' : flag.type === 'bias' ? '#eef1fb' : '#fdeceb',
                      color: flag.type === 'flat' ? 'var(--coral-deep)' : flag.type === 'bias' ? '#4453b8' : '#c0392b'
                    }}
                  >
                    {FLAG_LABEL[flag.type]}
                  </span>
                </div>
                <span style={{ fontSize: '12.5px' }}>{flag.title}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    const newRecords = {...records}
                    flag.keys.forEach(k => {
                      if (newRecords[k]) {
                        newRecords[k].excluded = false
                      }
                    })
                    setRecords(newRecords)
                    setDanceData('records', selectedClass, newRecords)
                    loadData()
                  }}
                  style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    background: !flag.keys.every(k => records[k]?.excluded) ? '#2f9e6e' : '#f5f5f5',
                    color: !flag.keys.every(k => records[k]?.excluded) ? '#fff' : '#999',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  ✓ 이상없음<br/><span style={{ fontSize: '10px' }}>(사용)</span>
                </button>
                <button
                  onClick={() => toggleFlag(idx)}
                  style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    background: flag.keys.every(k => records[k]?.excluded) ? '#c0392b' : '#f5f5f5',
                    color: flag.keys.every(k => records[k]?.excluded) ? '#fff' : '#999',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  ✕ 이상있음<br/><span style={{ fontSize: '10px' }}>(제외)</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* 결과평가 채점 */}
      <div className="dance-card">
        <div className="dance-step-label">결과평가 채점 (조별)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {Object.keys(groups).map(group => (
            <div key={group}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                {group} (조장: {leaders[group]})
              </label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {RESULT_RUBRIC.map(r => (
                  <button
                    key={r.score}
                    onClick={() => setResultScore(group, r.score)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line)',
                      background: teacherResults[group] === r.score ? 'var(--navy)' : '#fff',
                      color: teacherResults[group] === r.score ? '#fff' : 'var(--navy)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {r.score}점
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최종 점수 */}
      <div className="dance-card">
        <div className="dance-step-label">최종 점수</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--navy)' }}>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '20%', overflow: 'hidden', textOverflow: 'ellipsis' }}>이름</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '16%' }}>1차</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '16%' }}>2차</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '16%' }}>과정</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '16%' }}>결과</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '16%' }}>총점</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groups).sort().map(group => (
              <Fragment key={group}>
                {/* 조 제목 */}
                <tr style={{ background: '#f5f5f5', borderTop: '2px solid var(--navy)' }}>
                  <td colSpan="6" style={{ padding: '8px 12px', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>
                    {group}
                  </td>
                </tr>
                {/* 조원들 */}
                {groups[group]
                  .sort((a, b) => {
                    const aNum = parseInt(a.match(/\d+/) ? a.match(/\d+/)[0] : '9999')
                    const bNum = parseInt(b.match(/\d+/) ? b.match(/\d+/)[0] : '9999')
                    return aNum - bNum
                  })
                  .map(name => {
                    const r1 = avgReceived('round1', name)
                    const r2 = avgReceived('round2', name)
                    const change1 = getScoreChange('round1', name)
                    const change2 = getScoreChange('round2', name)

                    let procAvg = null
                    if (r1 !== null && r2 !== null) procAvg = (r1 + r2) / 2
                    else if (r1 !== null) procAvg = r1
                    else if (r2 !== null) procAvg = r2

                    const procBand = bandProcess(procAvg)
                    const resultScore = teacherResults[group]
                    const resultOverride = resultOverrides[name] || 0
                    const finalResultScore = (resultScore || 0) + resultOverride
                    const computed = procBand !== null && resultScore !== null && resultScore !== undefined ? procBand + finalResultScore : null
                    const displayVal = overrides[name] !== undefined ? overrides[name] : computed

                    // 과정점수 변화 계산
                    let procBandChange = null
                    if (change1 !== null || change2 !== null) {
                      const newAvg1 = change1 !== null ? (r1 - change1) : r1
                      const newAvg2 = change2 !== null ? (r2 - change2) : r2
                      let oldProcAvg = null
                      if (newAvg1 !== null && newAvg2 !== null) oldProcAvg = (newAvg1 + newAvg2) / 2
                      else if (newAvg1 !== null) oldProcAvg = newAvg1
                      else if (newAvg2 !== null) oldProcAvg = newAvg2
                      const oldProcBand = bandProcess(oldProcAvg)
                      if (oldProcBand !== procBand) procBandChange = procBand - oldProcBand
                    }

                    // 총점 변화 (과정점수 변화 + 결과평가 조정)
                    let totalChange = (procBandChange || 0) + (resultOverride || 0)
                    if (totalChange === 0) totalChange = null

                    const ScoreDisplay = ({value, change}) => (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span>{value || '-'}</span>
                        {change !== null && (
                          <span style={{ fontSize: '10px', color: '#ff6b4a', fontWeight: '700' }}>
                            {change > 0 ? '↑' : '↓'}{Math.abs(change).toFixed(1)}
                          </span>
                        )}
                      </div>
                    )

                    // 결과평가 변화량
                    const resultChange = resultOverride !== 0 ? resultOverride : null

                    return (
                      <tr key={name} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '6px', fontSize: '12px', width: '20%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</td>
                        <td style={{ textAlign: 'center', padding: '6px', width: '16%' }}>
                          <ScoreDisplay value={r1?.toFixed(1)} change={change1} />
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px', width: '16%' }}>
                          <ScoreDisplay value={r2?.toFixed(1)} change={change2} />
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px', width: '16%' }}>
                          <ScoreDisplay value={procBand} change={procBandChange} />
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px', width: '16%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <span style={{ fontSize: '12px' }}>{finalResultScore || '-'}</span>
                              {resultChange !== null && (
                                <span style={{ fontSize: '10px', color: '#ff6b4a', fontWeight: '700' }}>
                                  {resultChange > 0 ? '↑' : '↓'}{Math.abs(resultChange)}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setResultModalStudent(name)
                                setResultModalValue(resultOverride)
                                setResultModalOpen(true)
                              }}
                              style={{
                                padding: '2px 6px',
                                fontSize: '11px',
                                background: '#4a90e2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontWeight: '700'
                              }}
                            >
                              ⚙
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px', width: '16%' }}>
                          <ScoreDisplay value={displayVal} change={totalChange} />
                        </td>
                      </tr>
                    )
                  })
                }
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 번호순 정렬 */}
      <div className="dance-card">
        <div className="dance-step-label">번호순 정렬 (나이스 입력용)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--navy)' }}>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '10%' }}>번호</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '20%' }}>이름</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '15%' }}>조</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '13%' }}>1차</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '13%' }}>2차</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '13%' }}>과정</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '13%' }}>결과</th>
              <th style={{ textAlign: 'center', padding: '6px', fontWeight: '700', width: '16%' }}>총점</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groups).length > 0 && (() => {
              const allStudents = []
              Object.keys(groups).forEach(group => {
                groups[group].forEach(name => {
                  allStudents.push({ name, group })
                })
              })
              return allStudents
                .sort((a, b) => {
                  const aNum = parseInt(STUDENT_NUMBERS[a.name]) || 999
                  const bNum = parseInt(STUDENT_NUMBERS[b.name]) || 999
                  return aNum - bNum
                })
                .map(({ name, group }) => {
                  const r1 = avgReceived('round1', name)
                  const r2 = avgReceived('round2', name)
                  let procAvg = null
                  if (r1 !== null && r2 !== null) procAvg = (r1 + r2) / 2
                  else if (r1 !== null) procAvg = r1
                  else if (r2 !== null) procAvg = r2
                  const procBand = bandProcess(procAvg)
                  const resultScore = teacherResults[group]
                  const resultOverride = resultOverrides[name] || 0
                  const finalResultScore = (resultScore || 0) + resultOverride
                  const computed = procBand !== null && resultScore ? procBand + finalResultScore : null
                  const displayVal = overrides[name] !== undefined ? overrides[name] : computed

                  return (
                    <tr key={name} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ textAlign: 'center', padding: '6px', fontWeight: '700', fontSize: '13px' }}>{STUDENT_NUMBERS[name] || '?'}</td>
                      <td style={{ padding: '6px', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</td>
                      <td style={{ textAlign: 'center', padding: '6px', fontSize: '12px' }}>{group}</td>
                      <td style={{ textAlign: 'center', padding: '6px' }}>{r1?.toFixed(1) || '-'}</td>
                      <td style={{ textAlign: 'center', padding: '6px' }}>{r2?.toFixed(1) || '-'}</td>
                      <td style={{ textAlign: 'center', padding: '6px' }}>{procBand || '-'}</td>
                      <td style={{ textAlign: 'center', padding: '6px' }}>{finalResultScore || '-'}</td>
                      <td style={{ textAlign: 'center', padding: '6px', fontWeight: '700', fontSize: '13px' }}>{displayVal || '-'}</td>
                    </tr>
                  )
                })
            })()}
          </tbody>
        </table>
      </div>
    </div>
    )}

    {/* 결과평가 조정 모달 */}
    {resultModalOpen && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#000' }}>
            {resultModalStudent} - 결과평가 조정
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#000' }}>
              조정값 (기본값: 0)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setResultModalValue(prev => prev - 1)}
                style={{
                  padding: '8px 14px',
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '16px'
                }}
              >
                −
              </button>
              <input
                type="number"
                value={resultModalValue}
                onChange={(e) => setResultModalValue(parseInt(e.target.value) || 0)}
                style={{
                  padding: '8px',
                  width: '80px',
                  textAlign: 'center',
                  borderRadius: '4px',
                  border: '2px solid #4a90e2',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#000',
                  background: '#ffffff'
                }}
              />
              <button
                onClick={() => setResultModalValue(prev => prev + 1)}
                style={{
                  padding: '8px 14px',
                  background: '#27ae60',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '16px'
                }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                const newOverrides = {...resultOverrides}
                if (resultModalValue === 0) {
                  delete newOverrides[resultModalStudent]
                } else {
                  newOverrides[resultModalStudent] = resultModalValue
                }
                setResultOverrides(newOverrides)
                setDanceData('result-overrides', selectedClass, newOverrides)
                // 데이터 새로고침 (총점 업데이트)
                loadData()
                setResultModalOpen(false)
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: '#4a90e2',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              ✓ 저장
            </button>
            <button
              onClick={() => setResultModalOpen(false)}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '15px',
                color: '#000'
              }}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    )}

    {tab === 'students' && (
      <StudentGroupManagement />
    )}
  </>
  )
}

export default DanceManagement
