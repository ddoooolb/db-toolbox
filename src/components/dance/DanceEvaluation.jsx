import { useState, useEffect } from 'react'
import DanceManagement from './DanceManagement'
import './dance-styles.css'

const keyFor = (name, classId) => `dance-eval-${name}:${classId}`
const ADMIN_PASSCODE = '3708'

const PROCESS_RUBRIC = [
  {score:20, text:"연습 내내 매우 집중하여 완벽하게 익히려 노력하고, 조원을 적극적으로 도와줌"},
  {score:18, text:"연습 내내 집중하여 완성도 있게 익히려 노력하고, 조원을 도움"},
  {score:16, text:"성실히 참여하여 자기 몫의 동작을 무리 없이 익힘"},
  {score:14, text:"참여하나 집중력이 오락가락하며 노력이 다소 부족함"},
  {score:12, text:"자주 다른 곳에 신경 쓰거나 소극적이어서 습득이 더딤"},
  {score:10, text:"연습 참여가 매우 소극적이며 노력이 거의 보이지 않음"},
  {score:8,  text:"참여는 했으나 특별한 노력 없이 자리만 지킴(최저점)"}
]

function DanceEvaluation() {
  const [activeTab, setActiveTab] = useState('student')
  const [step, setStep] = useState('class')
  const [activeClass, setActiveClass] = useState(null)
  const [evalType, setEvalType] = useState(null)
  const [myGroup, setMyGroup] = useState(null)
  const [myName, setMyName] = useState(null)
  const [ratings, setRatings] = useState({})
  const [lockNotice, setLockNotice] = useState('')
  const [submitMsg, setSubmitMsg] = useState({type: '', text: ''})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [warnOpen, setWarnOpen] = useState(false)
  const [teacherAuthed, setTeacherAuthed] = useState(false)
  const [adminPassInput, setAdminPassInput] = useState('')
  const [adminPassMsg, setAdminPassMsg] = useState({type: '', text: ''})
  const [classes, setClasses] = useState({})
  const [openState, setOpenState] = useState({})

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(keyFor('open', activeClass)) || '{}')
    setOpenState(saved)
  }, [activeClass])

  useEffect(() => {
    const timer = setTimeout(() => {
      const groupsData = JSON.parse(localStorage.getItem('groups-data') || '{}')
      const builtClasses = {}
      Object.entries(groupsData).forEach(([classId, classGroups]) => {
        builtClasses[classId] = {
          label: classId,
          groups: {},
          leaders: {}
        }
        Object.entries(classGroups).forEach(([groupName, groupData]) => {
          const memberNames = groupData.members.map(m => m.name)
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
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const classData = activeClass ? classes[activeClass] : null
  const groups = classData?.groups || {}
  const leaders = classData?.leaders || {}

  const handleClassSelect = (classId) => {
    setActiveClass(classId)
    setStep('evalType')
  }

  const handleEvalTypeSelect = (type) => {
    if (!openState[type]) {
      setLockNotice(`${type === 'round1' ? '1차' : '2차'} 평가가 아직 열려있지 않습니다.`)
      return
    }
    setLockNotice('')
    setEvalType(type)
    setStep('who')
  }

  const handleNameSelect = (name) => {
    setMyName(name)
    const submitted = JSON.parse(localStorage.getItem(keyFor('submitted', activeClass)) || '{}')
    const key = `${evalType}|${name}`

    if (submitted[key]) {
      setStep('submitted')
    } else {
      setStep('targets')
      setRatings({})
    }
  }

  const getTargets = () => {
    return groups[myGroup]?.filter(n => n !== myName) || []
  }

  const handleSubmit = () => {
    const targets = getTargets()
    if (!targets.every(t => ratings[t])) {
      alert('모든 대상을 평가해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const records = JSON.parse(localStorage.getItem(keyFor('records', activeClass)) || '{}')
      targets.forEach(target => {
        const key = `${evalType}|${myName}|${target}`
        records[key] = {
          evalType,
          raterGroup: myGroup,
          raterName: myName,
          target,
          score: ratings[target],
          ts: Date.now()
        }
      })
      localStorage.setItem(keyFor('records', activeClass), JSON.stringify(records))

      const submitted = JSON.parse(localStorage.getItem(keyFor('submitted', activeClass)) || '{}')
      submitted[`${evalType}|${myName}`] = true
      localStorage.setItem(keyFor('submitted', activeClass), JSON.stringify(submitted))

      setSubmitMsg({type: 'ok', text: '제출 완료! 참여해줘서 고마워요 🙌'})
      setTimeout(() => setStep('submitted'), 1500)
    } catch (e) {
      setSubmitMsg({type: 'err', text: `제출 실패: ${e.message}`})
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdminAuth = () => {
    if (adminPassInput === ADMIN_PASSCODE) {
      setTeacherAuthed(true)
      setAdminPassMsg({type: '', text: ''})
      setAdminPassInput('')
    } else {
      setAdminPassMsg({type: 'err', text: '암호가 올바르지 않아요.'})
    }
  }

  return (
    <div className="dance-wrap">
      <header className="dance-header">
        <div className="dance-eyebrow">3학년 2학기 체육 · 표현(댄스)</div>
        <h1>댄스 표현하기 과정평가(동료평가)</h1>
      </header>

      <nav style={{
        display: 'flex',
        gap: '6px',
        padding: '14px 20px 0'
      }}>
        <button
          onClick={() => {
            setActiveTab('student')
            setTeacherAuthed(false)
          }}
          style={{
            flex: 1,
            padding: '10px 8px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'student' ? 'var(--paper)' : 'transparent',
            color: activeTab === 'student' ? 'var(--navy)' : 'var(--mute)',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '13.5px'
          }}
        >
          학생 참여
        </button>
        <button
          onClick={() => setActiveTab('teacher')}
          style={{
            flex: 1,
            padding: '10px 8px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'teacher' ? 'var(--paper)' : 'transparent',
            color: activeTab === 'teacher' ? 'var(--navy)' : 'var(--mute)',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '13.5px'
          }}
        >
          선생님 보기
        </button>
      </nav>

      <main style={{ padding: '18px 20px 0' }}>
        {/* 학생 탭 */}
        {activeTab === 'student' && !teacherAuthed && (
          <>
            {step === 'class' && (
              <>
                {/* 가이드 */}
                <div className="dance-card dance-guide-card">
                  <button
                    className="dance-guide-summary"
                    onClick={() => setGuideOpen(!guideOpen)}
                    style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', padding: 0 }}
                  >
                    📋 어떻게 평가하고, 어떻게 점수가 되는지 보기
                    <span style={{ marginLeft: 'auto' }}>{guideOpen ? '▴' : '▾'}</span>
                  </button>
                  {guideOpen && (
                    <div className="dance-guide-details">
                      <p><b>무엇을 평가하나요?</b><br/>
                      같은 조 조원끼리, 연습에 얼마나 성실히 참여했는지를 서로 평가해요. 몇 번 빠졌는지가 아니라 <b>참여한 시간 동안 얼마나 노력했는지</b>만 봐요.</p>

                      <p><b>언제 평가하나요?</b><br/>
                      연습 기간 중 <b>1차</b>(중반), <b>2차</b>(막바지) 두 번 평가해요. 조원 전체를 한 번에 다 평가하고 제출하면, 그 회차는 다시 제출할 수 없어요.</p>

                      <p><b>채점기준 (20점 만점, 최저 8점)</b></p>
                      <table className="dance-guide-table">
                        <tbody>
                          <tr><td className="gscore">20</td><td>연습 내내 매우 집중하여 완벽하게 익히려 노력하고, 조원을 적극적으로 도와줌</td></tr>
                          <tr><td className="gscore">18</td><td>연습 내내 집중하여 완성도 있게 익히려 노력하고, 조원을 도움</td></tr>
                          <tr><td className="gscore">16</td><td>성실히 참여하여 자기 몫의 동작을 무리 없이 익힘</td></tr>
                          <tr><td className="gscore">14</td><td>참여하나 집중력이 오락가락하며 노력이 다소 부족함</td></tr>
                          <tr><td className="gscore">12</td><td>자주 다른 곳에 신경 쓰거나 소극적이어서 습득이 더딤</td></tr>
                          <tr><td className="gscore">10</td><td>연습 참여가 매우 소극적이며 노력이 거의 보이지 않음</td></tr>
                          <tr><td className="gscore">8</td><td>참여는 했으나 특별한 노력 없이 자리만 지킴 (최저점)</td></tr>
                        </tbody>
                      </table>

                      <p><b>최종 점수는 어떻게 계산되나요?</b><br/>
                      나를 평가한 조원들의 점수 평균을 먼저 구하고(1차, 2차 각각), 그 두 평균을 다시 평균 내요. 그 값이 아래 표에 따라 최종 점수로 정해져요.</p>
                      <table className="dance-guide-table">
                        <tbody>
                          <tr><td>18점 초과 ~ 20점 이하</td><td className="gscore">20점</td></tr>
                          <tr><td>16점 초과 ~ 18점 이하</td><td className="gscore">18점</td></tr>
                          <tr><td>14점 초과 ~ 16점 이하</td><td className="gscore">16점</td></tr>
                          <tr><td>12점 초과 ~ 14점 이하</td><td className="gscore">14점</td></tr>
                          <tr><td>10점 초과 ~ 12점 이하</td><td className="gscore">12점</td></tr>
                          <tr><td>8점 초과 ~ 10점 이하</td><td className="gscore">10점</td></tr>
                          <tr><td>8점 이하</td><td className="gscore">8점</td></tr>
                        </tbody>
                      </table>

                      <p style={{ marginBottom: 0 }}><b>이 점수 외에 결과평가(15점)</b>가 수업 시간에 조별로 댄스 수행평가(결과물 발표)를 보고 선생님이 직접 채점하는 방식으로 따로 있고, 두 점수를 합쳐서 수행평가 점수가 정해져요.</p>
                    </div>
                  )}
                </div>

                {/* 경고 */}
                <div className="dance-card dance-guide-card dance-warn-card">
                  <button
                    className="dance-guide-summary"
                    onClick={() => setWarnOpen(!warnOpen)}
                    style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', padding: 0 }}
                  >
                    ⚠ 이렇게 하면 걸려요 (부정행위 예시)
                    <span style={{ marginLeft: 'auto' }}>{warnOpen ? '▴' : '▾'}</span>
                  </button>
                  {warnOpen && (
                    <div className="dance-guide-details">
                      <p>이 시스템은 여러분이 서로 매기는 점수를 자동으로 검사해서, 이상한 패턴이 있으면 선생님 화면에 바로 표시돼요.</p>

                      <p><b>① 담합 (몰아주기)</b><br/>
                      친한 친구에게만 높은 점수를 주고 다른 친구에게는 낮은 점수를 주면 바로 잡혀요.<br/>
                      → <b>"큰 점수 차이"</b>로 감지됩니다.</p>

                      <p><b>② 보복성 낮은 점수</b><br/>
                      감정적으로 특정 친구에게만 낮은 점수를 주면 감지돼요.<br/>
                      → 이것도 <b>"큰 점수 차이"</b>로 잡혀요.</p>

                      <p><b>③ 대충 평가하기</b><br/>
                      모든 친구에게 같은 점수를 주면 성의 없는 평가로 잡혀요.<br/>
                      → <b>"전원 동일 점수"</b>로 감지됩니다.</p>

                      <p style={{ marginBottom: 0 }}><b>④ 전반적 편향</b><br/>
                      다른 학생들보다 항상 훨씬 후하거나 박하게 평가하는 습관이 있으면 감지돼요.<br/>
                      → <b>"전반적 편향"</b>으로 잡혀요.</p>
                    </div>
                  )}
                </div>

                {/* 우리 반 선택 */}
                <div className="dance-card">
                  <div className="dance-step-label">Step 0 · 우리 반</div>
                  <label className="dance-field-label" style={{ marginTop: 0 }}>내 반을 선택하세요</label>
                  <select
                    className="dance-select"
                    onChange={(e) => e.target.value && handleClassSelect(e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    {Object.entries(classes).map(([id, data]) => (
                      <option key={id} value={id}>{data.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {step === 'evalType' && classData && (
              <div className="dance-card">
                <div className="dance-step-label">Step 1 · 평가 유형</div>
                <div className="dance-eval-type-grid">
                  <button
                    className={`dance-eval-type-btn ${evalType === 'round1' ? 'sel' : ''}`}
                    onClick={() => handleEvalTypeSelect('round1')}
                    disabled={!openState.round1}
                    style={{ opacity: !openState.round1 ? 0.5 : 1, cursor: !openState.round1 ? 'not-allowed' : 'pointer' }}
                  >
                    과정평가<br/>1차
                  </button>
                  <button
                    className={`dance-eval-type-btn ${evalType === 'round2' ? 'sel' : ''}`}
                    onClick={() => handleEvalTypeSelect('round2')}
                    disabled={!openState.round2}
                    style={{ opacity: !openState.round2 ? 0.5 : 1, cursor: !openState.round2 ? 'not-allowed' : 'pointer' }}
                  >
                    과정평가<br/>2차
                  </button>
                </div>
                {lockNotice && <div className="dance-msg err">{lockNotice}</div>}
              </div>
            )}

            {step === 'who' && classData && (
              <div className="dance-card">
                <div className="dance-step-label">Step 2 · 내 정보</div>
                <label className="dance-field-label">내 조</label>
                <select
                  className="dance-select"
                  onChange={(e) => setMyGroup(e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {Object.keys(groups).map(g => (
                    <option key={g} value={g}>{g} (조장: {leaders[g]})</option>
                  ))}
                </select>

                {myGroup && (
                  <>
                    <label className="dance-field-label">내 이름</label>
                    <select
                      className="dance-select"
                      onChange={(e) => e.target.value && handleNameSelect(e.target.value)}
                    >
                      <option value="">선택하세요</option>
                      {groups[myGroup]?.map(name => (
                        <option key={name} value={name}>
                          {name}{name === leaders[myGroup] ? ' (조장)' : ''}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            )}

            {step === 'targets' && classData && (
              <div className="dance-card">
                <div className="dance-step-label">Step 3 · 평가하기</div>

                {getTargets().map(target => (
                  <div key={target} className="dance-target-block">
                    <div className="dance-target-name">{target}</div>
                    {PROCESS_RUBRIC.map(rubric => (
                      <label
                        key={rubric.score}
                        className={`dance-rubric-opt ${ratings[target] === rubric.score ? 'sel' : ''}`}
                        onClick={() => setRatings({...ratings, [target]: rubric.score})}
                      >
                        <input
                          type="radio"
                          name={`r_${target}`}
                          checked={ratings[target] === rubric.score}
                          readOnly
                        />
                        <span className="dance-rubric-text">{rubric.text}</span>
                        <span className="dance-rubric-score">{rubric.score}점</span>
                      </label>
                    ))}
                  </div>
                ))}

                <button
                  className="dance-submit-btn"
                  disabled={!getTargets().every(t => ratings[t]) || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? '제출 중...' : '제출하기'}
                </button>

                {submitMsg.text && (
                  <div className={`dance-msg ${submitMsg.type}`}>
                    {submitMsg.text}
                  </div>
                )}
              </div>
            )}

            {step === 'submitted' && (
              <div className="dance-card">
                <div className="dance-msg ok">
                  ✓ 이미 제출했어요. 다시 제출하려면 선생님께 요청해주세요.
                </div>
              </div>
            )}
          </>
        )}

        {/* 선생님 탭 */}
        {activeTab === 'teacher' && !teacherAuthed && (
          <div className="dance-card">
            <div className="dance-step-label">교사 인증</div>
            <label className="dance-field-label" style={{ marginTop: 0 }}>관리자 암호</label>
            <input
              type="password"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
              placeholder="암호 입력"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--line)',
                fontSize: '15px',
                boxSizing: 'border-box',
                background: '#fff',
                color: '#000'
              }}
            />
            <button
              onClick={handleAdminAuth}
              className="dance-submit-btn"
              style={{ marginTop: '12px' }}
            >
              확인
            </button>
            {adminPassMsg.text && (
              <div className={`dance-msg ${adminPassMsg.type}`}>
                {adminPassMsg.text}
              </div>
            )}
          </div>
        )}

        {activeTab === 'teacher' && teacherAuthed && (
          <DanceManagement />
        )}
      </main>

      <div className="dance-footer-note">제출한 평가는 같은 항목에 다시 제출하면 이전 응답을 덮어씁니다.</div>
    </div>
  )
}

export default DanceEvaluation
