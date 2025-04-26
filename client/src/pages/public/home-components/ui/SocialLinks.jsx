import React from 'react'
import { motion } from 'framer-motion'
import { FiInstagram } from 'react-icons/fi'

/**
 * Componente que muestra enlaces a redes sociales
 * con animaciones al interactuar
 */
const SocialLinks = () => {
  const socialLinks = [
    {
      url: "https://www.instagram.com/tramboory/",
      label: "Tramboory Instagram"
    },
    {
      url: "https://www.instagram.com/tramboory.express/",
      label: "Tramboory Express Instagram"
    }
  ];

  return (
    <div className="mt-10">
      <h3 className="text-center md:text-left text-white text-xl mb-6 font-funhouse">
        Síguenos en redes sociales
      </h3>
      <div className="flex justify-center md:justify-start space-x-6">
        {socialLinks.map((link, index) => (
          <motion.a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center
              hover:bg-white/20 transition-colors duration-300 border border-purple-500/30 shadow-lg"
            aria-label={link.label}
          >
            <FiInstagram className="text-yellow-400 text-xl" />
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;