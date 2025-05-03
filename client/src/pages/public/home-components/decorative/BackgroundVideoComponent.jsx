import React from 'react'
import { FiPause, FiPlay } from 'react-icons/fi'
import BackgroundVideo from '@/video/background.webm'

/**
 * Componente que maneja el video de fondo y proporciona
 * controles para pausar/reproducir
 */
const BackgroundVideoComponent = ({ videoRef, isVideoPlaying, toggleVideo }) => (
  <div className="fixed inset-0 z-0">
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className="absolute min-w-full min-h-full object-cover w-full h-full"
    >
      <source src={BackgroundVideo} type="video/webm" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-purple-900/60 to-indigo-950/70 backdrop-blur-[2px]" />
    <button
      onClick={toggleVideo}
      className="absolute bottom-4 right-4 z-50 p-3 sm:p-4 rounded-full bg-white/10 backdrop-blur-md
        hover:bg-white/20 transition-all duration-300 border border-white/20
        transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400/50
        cursor-pointer touch-manipulation"
      aria-label={isVideoPlaying ? "Pausar video" : "Reproducir video"}
    >
      {isVideoPlaying ? (
        <FiPause className="text-white text-xl sm:text-2xl" />
      ) : (
        <FiPlay className="text-white text-xl sm:text-2xl" />
      )}
    </button>
  </div>
);

export default BackgroundVideoComponent;