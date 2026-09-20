import { motion } from 'framer-motion'

export default function TyphoonEyeAnimation() {
  return (
    <div className="animation-container">
      <svg width="100%" height="300" viewBox="0 0 400 300">
        {/* 중앙 원 */}
        <circle cx="200" cy="150" r="80" fill="none" stroke="#f5576c" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />

        {/* 회전하는 사람들 */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
          const angle = (i / 8) * Math.PI * 2
          const x = 200 + 70 * Math.cos(angle)
          const y = 150 + 70 * Math.sin(angle)

          return (
            <motion.g
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ originX: 200, originY: 150 }}
            >
              {/* 머리 */}
              <circle cx={x} cy={y} r="8" fill="#FFD700" />
              {/* 몸 */}
              <line x1={x} y1={y + 8} x2={x} y2={y + 25} stroke="#667eea" strokeWidth="2" />
              {/* 팔 */}
              <line x1={x - 10} y1={y + 15} x2={x + 10} y2={y + 15} stroke="#667eea" strokeWidth="2" />
              {/* 다리 */}
              <line x1={x} y1={y + 25} x2={x - 5} y2={y + 35} stroke="#667eea" strokeWidth="2" />
              <line x1={x} y1={y + 25} x2={x + 5} y2={y + 35} stroke="#667eea" strokeWidth="2" />
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}
