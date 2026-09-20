import { motion } from 'framer-motion'

export default function RelayAnimation() {
  return (
    <div className="animation-container">
      <svg width="100%" height="300" viewBox="0 0 400 300">
        {/* 러너들 */}
        {[0, 1, 2, 3].map(i => (
          <motion.g
            key={i}
            animate={{ x: [i * 80, 320 - i * 80, i * 80] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.8 }}
          >
            {/* 머리 */}
            <circle cx="60" cy="120" r="10" fill="#FFD700" />
            {/* 몸 */}
            <line x1="60" y1="130" x2="60" y2="170" stroke="#667eea" strokeWidth="3" />
            {/* 팔 */}
            <motion.line
              x1="50"
              y1="145"
              x2="70"
              y2="145"
              stroke="#667eea"
              strokeWidth="2"
              animate={{ rotate: [0, 30, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ originX: 60, originY: 145 }}
            />
            {/* 다리 */}
            <motion.line
              x1="60" y1="170" x2="55" y2="210"
              stroke="#667eea" strokeWidth="3"
              animate={{ x1: [60, 55, 60], x2: [55, 50, 55] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.line
              x1="60" y1="170" x2="65" y2="210"
              stroke="#667eea" strokeWidth="3"
              animate={{ x1: [60, 65, 60], x2: [65, 70, 65] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />

            {/* 배턴 */}
            <motion.rect
              x="68" y="140" width="4" height="20"
              fill="#FFB347"
              animate={{ x: [68, 72, 68] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </motion.g>
        ))}

        {/* 트랙 */}
        <line x1="40" y1="250" x2="360" y2="250" stroke="#999" strokeWidth="2" />
        <circle cx="40" cy="250" r="3" fill="#FFD700" />
        <circle cx="360" cy="250" r="3" fill="#FFD700" />
      </svg>
    </div>
  )
}
