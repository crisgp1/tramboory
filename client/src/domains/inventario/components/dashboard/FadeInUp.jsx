import { motion } from 'framer-motion';

/**
 * Componente de animación que hace aparecer elementos con un efecto de subida
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elementos a animar
 * @param {number} props.delay - Retraso de la animación en segundos
 * @param {string} props.className - Clases CSS adicionales
 * @param {number} props.duration - Duración de la animación en segundos
 */
const FadeInUp = ({ children, delay = 0, className = "", duration = 0.4 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default FadeInUp;