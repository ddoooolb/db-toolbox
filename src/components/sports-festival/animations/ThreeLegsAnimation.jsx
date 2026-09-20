import { motion } from 'framer-motion'

export default function ThreeLegsAnimation() {
  return (
    <div className="animation-container">
      <svg width="100%" height="300" viewBox="0 0 400 300">
        {/* 사람 1 */}
        <motion.g
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {/* 머리 */}
          <circle cx="80" cy="120" r="10" fill="#FFD700" />
          {/* 몸 */}
          <line x1="80" y1="130" x2="80" y2="170" stroke="#667eea" strokeWidth="3" />
          {/* 팔 */}
          <line x1="60" y1="145" x2="100" y2="145" stroke="#667eea" strokeWidth="2" />
          {/* 다리 1 (왼쪽 - 고정) */}
          <line x1="75" y1="170" x2="70" y2="210" stroke="#667eea" strokeWidth="3" />
          {/* 다리 2 (오른쪽 - 묶여있음) */}
          <line x1="85" y1="170" x2="90" y2="210" stroke="#f5576c" strokeWidth="3" strokeDasharray="3,3" />
        </motion.g>

        {/* 사람 2 */}
        <motion.g
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
        >
          {/* 머리 */}
          <circle cx="180" cy="120" r="10" fill="#FFD700" />
          {/* 몸 */}
          <line x1="180" y1="130" x2="180" y2="170" stroke="#667eea" strokeWidth="3" />
          {/* 팔 */}
          <line x1="160" y1="145" x2="200" y2="145" stroke="#667eea" strokeWidth="2" />
          {/* 다리 1 (왼쪽 - 묶여있음) */}
          <line x1="175" y1="170" x2="170" y2="210" stroke="#f5576c" strokeWidth="3" strokeDasharray="3,3" />
          {/* 다리 2 (오른쪽 - 고정) */}
          <line x1="185" y1="170" x2="190" y2="210" stroke="#667eea" strokeWidth="3" />
        </motion.g>

        {/* 묶는 줄 */}
        <line x1="90" y1="170" x2="170" y2="170" stroke="#f5576c" strokeWidth="2" strokeDasharray="5,5" />

        {/* 결승선 */}
        <line x1="300" y1="100" x2="300" y2="220" stroke="#FFD700" strokeWidth="3" />
        <line x1="290" y1="110" x2="310" y2="110" stroke="#FFD700" strokeWidth="2" />
        <line x1="290" y1="130" x2="310" y2="130" stroke="#FFD700" strokeWidth="2" />
        <line x1="290" y1="150" x2="310" y2="150" stroke="#FFD700" strokeWidth="2" />
        <line x1="290" y1="170" x2="310" y2="170" stroke="#FFD700" strokeWidth="2" />
        <line x1="290" y1="190" x2="310" y2="190" stroke="#FFD700" strokeWidth="2" />
        <line x1="290" y1="210" x2="310" y2="210" stroke="#FFD700" strokeWidth="2" />
      </svg>
    </div>
  )
}
