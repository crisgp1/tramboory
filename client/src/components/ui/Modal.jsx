import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle, FiInfo, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '4xl',
  showCloseButton = true,
  type = 'default', // 'default', 'info', 'warning', 'success', 'error'
  description = '',
}) => {
  // Add event listener for escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscKey);

    // Disable body scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]); // Dependency array with onClose function
  
  // Determine icon based on modal type
  const getModalIcon = () => {
    switch (type) {
      case 'info':
        return <FiInfo className="text-blue-500" size={24} />;
      case 'warning':
        return <FiAlertCircle className="text-amber-500" size={24} />;
      case 'success':
        return <FiCheckCircle className="text-green-500" size={24} />;
      case 'error':
        return <FiAlertCircle className="text-red-500" size={24} />;
      case 'help':
        return <FiHelpCircle className="text-indigo-500" size={24} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !e.defaultPrevented) {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }
            }}
          >
            {/* Modal Container */}
            <motion.div 
              className={`bg-white rounded-lg shadow-xl w-full max-w-${maxWidth} flex flex-col max-h-[90vh] overflow-hidden`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <div className="flex items-center">
                  {getModalIcon() && (
                    <div className="mr-3">
                      {getModalIcon()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {title}
                    </h2>
                    {description && (
                      <p className="text-sm text-gray-500 mt-1">{description}</p>
                    )}
                  </div>
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out p-1 rounded-full hover:bg-gray-100"
                    aria-label="Cerrar"
                  >
                    <FiX size={24} />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 sticky bottom-0 bg-white z-10">
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
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  footer: PropTypes.node,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']),
  showCloseButton: PropTypes.bool,
  type: PropTypes.oneOf(['default', 'info', 'warning', 'success', 'error', 'help']),
  description: PropTypes.string,
};

export default Modal;