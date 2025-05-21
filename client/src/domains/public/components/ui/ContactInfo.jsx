import React from 'react'
import { motion } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi'

/**
 * Componente que muestra la información de contacto organizada
 * con animaciones de entrada
 */
const ContactInfo = () => {
  const contactItems = [
    {
      icon: FiPhone,
      title: "Teléfono",
      content: "+52 (33) 3230 0243"
    },
    {
      icon: FiMail,
      title: "Email",
      content: "contacto@tramboory.com"
    },
    {
      icon: FiMapPin,
      title: "Ubicación",
      content: [
        "P. Solares 1639",
        "Solares Residencial",
        "Zapopan, Jalisco, C.P. 45019"
      ]
    }
  ];

  return (
    <div className="flex flex-col space-y-8">
      {contactItems.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 }}
          className="flex items-start space-x-4 p-4 rounded-xl hover:bg-white/5 transition-colors duration-300"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center border border-purple-500/30">
            <item.icon className="text-yellow-400 text-xl" />
          </div>
          <div>
            <h3 className="text-white font-bold">{item.title}</h3>
            {Array.isArray(item.content) ? (
              item.content.map((line, i) => (
                <p key={i} className="text-gray-300">{line}</p>
              ))
            ) : item.title === "Teléfono" ? (
              <motion.a
                href={`https://wa.me/523332300243?text=Hola%2C%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios%20para%20fiestas%20infantiles.`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {item.content}
              </motion.a>
            ) : (
              <p className="text-gray-300">{item.content}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ContactInfo;