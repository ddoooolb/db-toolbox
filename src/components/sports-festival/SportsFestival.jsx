import { useState } from 'react'
import { motion } from 'framer-motion'
import './SportsFestival.css'
import RopeJumpAnimation from './animations/RopeJumpAnimation'
import TyphoonEyeAnimation from './animations/TyphoonEyeAnimation'
import BallBounceAnimation from './animations/BallBounceAnimation'
import ThreeLegsAnimation from './animations/ThreeLegsAnimation'
import RelayAnimation from './animations/RelayAnimation'

const SPORTS = [
  {
    id: 1,
    name: '8자 줄넘기',
    type: '기록형',
    icon: '🪢',
    time: '10:00 - 10:30',
    animation: RopeJumpAnimation
  },
  {
    id: 2,
    name: '태풍의눈',
    type: '경쟁형',
    icon: '🌪️',
    time: '10:30 - 11:20',
    animation: TyphoonEyeAnimation
  },
  {
    id: 3,
    name: '협동 공튀기기',
    type: '기록형',
    icon: '🏐',
    time: '11:50 - 12:20',
    animation: BallBounceAnimation
  },
  {
    id: 4,
    name: '2인 3각 미션달리기',
    type: '기록형',
    icon: '🏃‍♂️',
    time: '13:50 - 14:20',
    animation: ThreeLegsAnimation
  },
  {
    id: 5,
    name: '계주',
    type: '경쟁형',
    icon: '🏃',
    time: '11:20 - 11:50 / 14:20 - 15:00',
    animation: RelayAnimation
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
                    className="sport-animation"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <sport.animation />
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
