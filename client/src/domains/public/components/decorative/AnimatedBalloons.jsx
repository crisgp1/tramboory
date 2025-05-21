import React from 'react'
import { motion } from 'framer-motion'

/**
 * Componente que genera globos animados para reforzar la temática infantil
 * con movimientos flotantes y colores vibrantes
 */
const AnimatedBalloons = () => {
  const balloons = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 30 + 20,
    x: Math.random() * 100,
    color: [
      'from-red-400 to-red-600',
      'from-blue-400 to-blue-600',
      'from-yellow-400 to-yellow-600',
      'from-green-400 to-green-600',
      'from-pink-400 to-pink-600',
      'from-purple-400 to-purple-600',
    ][Math.floor(Math.random() * 6)],
    duration: Math.random() * 20 + 30,
    delay: Math.random() * 15
  }));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {balloons.map((balloon) => (
        <motion.div
          key={balloon.id}
          className={`absolute bg-gradient-to-b ${balloon.color}`}
          style={{
            width: balloon.size,
            height: balloon.size * 1.2,
            left: `${balloon.x}%`,
            bottom: '-10%',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          }}
          animate={{
            y: [0, -window.innerHeight * 1.2],
            rotate: [0, 10, -10, 5, 0],
            opacity: [0.7, 0.8, 0.7, 0]
          }}
          transition={{
            duration: balloon.duration,
            repeat: Infinity,
            delay: balloon.delay,
            ease: "linear"
          }}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0.5 h-16 bg-white/30" />
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedBalloons;