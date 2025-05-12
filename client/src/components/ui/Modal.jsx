import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle, FiInfo, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '4xl',
  showCloseButton = true,
  type = 'default',
  description = '',
  closeOnEscape = true,
  closeOnOverlay = true,
  persistent = false,
  hideHeader = false,
  centered = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Handle keyboard events
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && closeOnEscape && !persistent) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, closeOnEscape, persistent]);
  
  // Get modal icon based on type
  const getModalIcon = () => {
    const iconClass = `${isDark ? 'text-opacity-80' : ''} mr-3`;
    switch (type) {
      case 'info':
        return <FiInfo className={`${iconClass} ${isDark ? 'text-blue-400' : 'text-blue-500'}`} size={24} />;
      case 'warning':
        return <FiAlertCircle className={`${iconClass} ${isDark ? 'text-amber-400' : 'text-amber-500'}`} size={24} />;
      case 'success':
        return <FiCheckCircle className={`${iconClass} ${isDark ? 'text-green-400' : 'text-green-500'}`} size={24} />;
      case 'error':
        return <FiAlertCircle className={`${iconClass} ${isDark ? 'text-red-400' : 'text-red-500'}`} size={24} />;
      case 'help':
        return <FiHelpCircle className={`${iconClass} ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} size={24} />;
      default:
        return null;
    }
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlay && !persistent) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: centered ? 20 : 0 },
    visible: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.9, opacity: 0, y: centered ? 20 : 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            className={`fixed inset-0 z-50 backdrop-blur-sm flex ${centered ? 'items-center' : 'items-start pt-20'} justify-center p-4`}
            style={{ backgroundColor: 'var(--modal-overlay)' }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          >
            {/* Modal Container */}
            <motion.div 
              className={`rounded-lg shadow-xl w-full max-w-${maxWidth} flex flex-col max-h-[90vh] overflow-hidden`}
              style={{ 
                backgroundColor: 'var(--modal-bg)',
                color: 'var(--modal-text)',
                borderColor: 'var(--panel-border)',
                border: '1px solid',
              }}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              {!hideHeader && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-10"
                  style={{
                    borderBottom: '1px solid var(--panel-border)',
                    backgroundColor: 'var(--modal-bg)'
                  }}
                >
                  <div className="flex items-center">
                    {getModalIcon()}
                    <div>
                      <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {title}
                      </h2>
                      {description && (
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="transition duration-150 ease-in-out p-1 rounded-full"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      aria-label="Cerrar modal"
                      whileHover={{ scale: 1.1, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiX size={24} />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 sticky bottom-0 z-10"
                  style={{
                    borderTop: '1px solid var(--panel-border)',
                    backgroundColor: 'var(--modal-bg)'
                  }}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']),
  showCloseButton: PropTypes.bool,
  type: PropTypes.oneOf(['default', 'info', 'warning', 'success', 'error', 'help']),
  description: PropTypes.string,
  closeOnEscape: PropTypes.bool,
  closeOnOverlay: PropTypes.bool,
  persistent: PropTypes.bool,
  hideHeader: PropTypes.bool,
  centered: PropTypes.bool,
};

export default Modal;