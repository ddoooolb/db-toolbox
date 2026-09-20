import { useState } from 'react'
import { motion } from 'framer-motion'
import './SportsFestival.css'

const SPORTS = [
  {
    id: 1,
    name: '8자 줄넘기',
    type: '기록형',
    icon: '🪢',
    time: '10:00 - 10:30',
    description: '큰 줄을 반이 함께 넘기며 기록을 겨루는 종목',
    rules: [
      '반 전체가 참여하는 대규모 줄넘기',
      '8자 모양으로 움직이면서 줄을 넘음',
      '정해진 시간 동안 몇 명이 연속으로 넘을 수 있는지 기록',
      '떨어지면 다시 시작'
    ]
  },
  {
    id: 2,
    name: '태풍의눈',
    type: '경쟁형',
    icon: '🌪️',
    time: '10:30 - 11:20',
    description: '큰 원 안에서 팀 전체의 협력이 중요한 종목',
    rules: [
      '반 전체가 큰 원을 만들어 태풍처럼 빙글빙글 돌기',
      '타이밍과 팀워크가 중요',
      '흐트러지지 않고 균형있게 움직여야 함',
      '연습된 티가 나고 정렬이 잘된 팀이 좋은 점수'
    ]
  },
  {
    id: 3,
    name: '협동 공튀기기',
    type: '기록형',
    icon: '🏐',
    time: '11:50 - 12:20',
    description: '여럿이 함께 공을 튀기며 몇 번까지 이어가는지 겨루는 종목',
    rules: [
      '정해진 수의 학생들이 함께 공을 튀김',
      '정해진 시간 또는 정해진 횟수까지 공을 떨어뜨리지 않고 튀김',
      '모든 학생이 공을 한 번씩 튀려야 함',
      '협동과 타이밍이 가장 중요'
    ]
  },
  {
    id: 4,
    name: '2인 3각 미션달리기',
    type: '기록형',
    icon: '🏃‍♂️',
    time: '13:50 - 14:20',
    description: '두 명이 한 팀을 이루어 다리를 묶고 함께 뛰는 종목',
    rules: [
      '2명씩 짝을 지어 한쪽 다리를 묶음',
      '정해진 거리를 미션을 수행하며 달림',
      '떨어지지 않고 함께 움직이기',
      '먼저 결승선에 도착하면 승리'
    ]
  },
  {
    id: 5,
    name: '계주',
    type: '경쟁형',
    icon: '🏃',
    time: '11:20 - 11:50 / 14:20 - 15:00',
    description: '배턴을 주고받으며 빠르게 달리는 종목',
    rules: [
      '반의 모든 학생이 참여하는 릴레이',
      '정해진 거리를 돌아서 다음 주자에게 배턴 전달',
      '배턴을 떨어뜨리지 않기',
      '팀 전체가 가장 빠른 속도로 달릴 때 우승'
    ]
  }
]

const SCHEDULE = [
  { time: '08:55 - 09:05', event: '운동장으로 이동' },
  { time: '09:10 - 09:30', event: '개회식' },
  { time: '09:30 - 10:00', event: '3학년 댄스 경연 1부' },
  { time: '10:00 - 10:30', event: '8자 줄넘기' },
  { time: '10:30 - 11:20', event: '태풍의눈' },
  { time: '11:20 - 11:50', event: '계주' },
  { time: '11:50 - 12:20', event: '협동 공튀기기' },
  { time: '12:20 - 13:20', event: '점심식사' },
  { time: '13:20 - 13:50', event: '3학년 댄스 경연 2부' },
  { time: '13:50 - 14:20', event: '2인 3각 미션달리기' },
  { time: '14:20 - 15:00', event: '계주' },
  { time: '15:00 - 15:30', event: '폐회식 및 정리' }
]

export default function SportsFestival() {
  const [activeTab, setActiveTab] = useState('intro')
  const [selectedSport, setSelectedSport] = useState(null)

  return (
    <div className="sports-festival">
      {/* 인트로 */}
      {activeTab === 'intro' && (
        <motion.div
          className="festival-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="intro-content"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              2026 체육한마당
            </motion.h1>
            <motion.div className="intro-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p>📅 2026년 10월 8일 (목)</p>
              <p>⏰ 09:00 ~ 15:25</p>
              <p>📍 보문 운동장</p>
              <p>👥 1학년, 2학년, 3학년</p>
            </motion.div>
            <motion.button
              className="btn-start"
              onClick={() => setActiveTab('sports')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              종목 확인하기 →
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* 종목 소개 */}
      {activeTab === 'sports' && (
        <motion.div
          className="festival-sports"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2>🏆 종목 소개</h2>
          <div className="sports-grid">
            {SPORTS.map((sport, idx) => (
              <motion.div
                key={sport.id}
                className="sport-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => setSelectedSport(selectedSport === sport.id ? null : sport.id)}
                whileHover={{ scale: 1.03 }}
              >
                <div className="sport-icon">{sport.icon}</div>
                <h3>{sport.name}</h3>
                <p className="sport-type">{sport.type}</p>
                <p className="sport-time">⏰ {sport.time}</p>
                {selectedSport === sport.id && (
                  <motion.div
                    className="sport-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="sport-description">{sport.description}</p>
                    <div className="sport-rules">
                      <h4>📋 경기 규칙:</h4>
                      <ul>
                        {sport.rules.map((rule, rIdx) => (
                          <li key={rIdx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          <motion.button
            className="btn-next"
            onClick={() => setActiveTab('schedule')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            일정 확인하기 →
          </motion.button>
        </motion.div>
      )}

      {/* 일정표 */}
      {activeTab === 'schedule' && (
        <motion.div
          className="festival-schedule"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2>⏰ 당일 일정</h2>
          <div className="schedule-list">
            {SCHEDULE.map((item, idx) => (
              <motion.div
                key={idx}
                className="schedule-item"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <div className="schedule-time">{item.time}</div>
                <div className="schedule-event">{item.event}</div>
              </motion.div>
            ))}
          </div>
          <motion.button
            className="btn-next"
            onClick={() => setActiveTab('outro')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            마무리 →
          </motion.button>
        </motion.div>
      )}

      {/* 아웃트로 */}
      {activeTab === 'outro' && (
        <motion.div
          className="festival-outro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="outro-content"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1>🎉 화이팅! 🎉</h1>
            <p>모든 학생이 함께하는</p>
            <p>즐거운 체육한마당!</p>
            <p>서로를 응원하고 협력하며</p>
            <p>좋은 추억을 만들어요!</p>
            <motion.button
              className="btn-back"
              onClick={() => setActiveTab('intro')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              처음으로 돌아가기
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* 네비게이션 */}
      <div className="nav-dots">
        {['intro', 'sports', 'schedule', 'outro'].map(tab => (
          <motion.button
            key={tab}
            className={`dot ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  )
}
