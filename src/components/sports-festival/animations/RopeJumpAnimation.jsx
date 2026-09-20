import { motion } from 'framer-motion'

export default function RopeJumpAnimation() {
  return (
    <div className="animation-container">
      <svg width="100%" height="300" viewBox="0 0 400 300">
        {/* 줄 애니메이션 */}
        <motion.path
          d="M 100 100 Q 200 50 300 100"
          stroke="#f5576c"
          strokeWidth="3"
          fill="none"
          animate={{
            d: [
              "M 100 100 Q 200 50 300 100",
              "M 100 100 Q 200 150 300 100",
              "M 100 100 Q 200 50 300 100"
            ]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* 사람들 */}
        {[0, 1, 2, 3].map(i => (
          <motion.g key={i}>
            {/* 머리 */}
            <circle cx={120 + i * 60} cy="180" r="8" fill="#FFD700" />
            {/* 몸 */}
            <line x1={120 + i * 60} y1="188" x2={120 + i * 60} y2="220" stroke="#4a90e2" strokeWidth="2" />
            {/* 다리 */}
            <motion.line
              x1={120 + i * 60}
              y1="220"
              x2={120 + i * 60 - 8}
              y2="240"
              stroke="#4a90e2"
              strokeWidth="2"
              animate={{ x2: [120 + i * 60 - 8, 120 + i * 60 + 8, 120 + i * 60 - 8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
            <motion.line
              x1={120 + i * 60}
              y1="220"
              x2={120 + i * 60 + 8}
              y2="240"
              stroke="#4a90e2"
              strokeWidth="2"
              animate={{ x2: [120 + i * 60 + 8, 120 + i * 60 - 8, 120 + i * 60 + 8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  )
}
