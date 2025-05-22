import React, { useEffect } from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';
import { motion } from 'framer-motion';
import BackgroundVideo from '@shared/assets/video/background.webm';

const BackgroundVideoComponent = ({ videoRef, isVideoPlaying, toggleVideo }) => {
  useEffect(() => {
    if (!videoRef.current) return;
    
    const videoElement = videoRef.current;
    
    const handlePlay = () => console.log("Video started playing via event");
    const handlePause = () => console.log("Video paused via event");
    const handleError = (e) => console.error("Video error:", e);
    
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('error', handleError);
    
    const playVideo = async () => {
      try {
        await videoElement.play();
        console.log("Video forzado a reproducir en montaje");
      } catch (error) {
        console.error("Error al forzar reproducción inicial:", error);
      }
    };
    
    playVideo();
    
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('error', handleError);
    };
  }, [videoRef]);

  const handleControlClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Video control button clicked directly");
    
    try {
      toggleVideo(e);
    } catch (error) {
      console.error("Error en handleControlClick:", error);
      
      if (videoRef.current) {
        if (isVideoPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(err => 
            console.error("Error reproduciendo video directamente:", err)
          );
        }
      }
    }
    
    return false;
  };

  return (
    <>
      {/* Video container */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src={BackgroundVideo} type="video/webm" />
            Tu navegador no soporta videos HTML5.
          </video>
        </div>
        
        {/* Overlay para mejorar contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-purple-900/60 to-indigo-950/70 backdrop-blur-[2px]"></div>
      </div>
      
      {/* Botón de control */}
      <div className="fixed bottom-6 right-6 z-[9999]" style={{ pointerEvents: 'auto' }}>
        <motion.button
          onClick={handleControlClick}
          whileHover={{ 
            scale: 1.15,
            boxShadow: "0 0 25px rgba(250, 204, 21, 0.6)"
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-yellow-400 text-purple-900 flex items-center justify-center
                    shadow-lg shadow-purple-900/50 border-2 border-yellow-300
                    hover:bg-yellow-300 active:bg-yellow-500
                    focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
          aria-label={isVideoPlaying ? "Pausar video de fondo" : "Reproducir video de fondo"}
          style={{ 
            cursor: 'pointer', 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          {isVideoPlaying ? (
            <FiPause className="text-xl md:text-3xl" />
          ) : (
            <FiPlay className="text-xl md:text-3xl" />
          )}
          
          {/* Efecto de pulso */}
          <motion.div
            className="absolute -inset-2 md:-inset-3 rounded-full bg-yellow-400/20 z-[-1]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
          />
        </motion.button>
      </div>
    </>
  );
};

export default BackgroundVideoComponent;