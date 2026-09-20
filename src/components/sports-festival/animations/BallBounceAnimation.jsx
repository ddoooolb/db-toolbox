import { motion } from 'framer-motion'

export default function BallBounceAnimation() {
  return (
    <div className="animation-container">
      <svg width="100%" height="300" viewBox="0 0 400 300">
        {/* 손들 */}
        {[0, 1, 2].map(i => (
          <g key={`hand-${i}`}>
            {/* 팔 */}
            <line x1={80 + i * 120} y1="100" x2={80 + i * 120} y2="150" stroke="#4a90e2" strokeWidth="3" />
            {/* 손 */}
            <circle cx={80 + i * 120} cy="155" r="8" fill="#FFB6C1" />
          </g>
        ))}

        {/* 튀는 공 */}
        <motion.circle
          cx="100"
          cy="200"
          r="12"
          fill="#f5576c"
          animate={{
            cx: [100, 140, 180, 220, 260, 300, 260, 220, 180, 140, 100],
            cy: [200, 180, 160, 140, 160, 180, 200, 180, 160, 140, 200]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* 바닥 */}
        <line x1="50" y1="250" x2="350" y2="250" stroke="#999" strokeWidth="2" />
      </svg>
    </div>
  )
}
