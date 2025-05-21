import React from 'react'
import { FiPhoneCall, FiMail, FiMapPin, FiClock } from 'react-icons/fi'

/**
 * Componente que muestra la información de contacto
 * con estilo mejorado y elementos interactivos
 */
const ContactInfo = () => {
  return (
    <div className="space-y-4">
      {/* Teléfono */}
      <div className="flex items-center gap-3 group">
        <div className="p-3 bg-indigo-900/50 rounded-lg group-hover:bg-indigo-800/60 transition-colors duration-300">
          <FiPhoneCall className="text-xl text-yellow-400" />
        </div>
        <div>
          <h4 className="text-sm text-gray-300">Teléfono</h4>
          <a 
            href="tel:+523332300243" 
            className="text-white hover:text-yellow-300 transition-colors duration-300"
          >
            +52 (33) 3230 0243
          </a>
        </div>
      </div>
      
      {/* Email */}
      <div className="flex items-center gap-3 group">
        <div className="p-3 bg-indigo-900/50 rounded-lg group-hover:bg-indigo-800/60 transition-colors duration-300">
          <FiMail className="text-xl text-green-400" />
        </div>
        <div>
          <h4 className="text-sm text-gray-300">Email</h4>
          <a 
            href="mailto:contacto@tramboory.com" 
            className="text-white hover:text-green-300 transition-colors duration-300"
          >
            contacto@tramboory.com
          </a>
        </div>
      </div>
      
      {/* Dirección */}
      <div className="flex items-center gap-3 group">
        <div className="p-3 bg-indigo-900/50 rounded-lg group-hover:bg-indigo-800/60 transition-colors duration-300">
          <FiMapPin className="text-xl text-blue-400" />
        </div>
        <div>
          <h4 className="text-sm text-gray-300">Dirección</h4>
          <a 
            href="https://maps.google.com/?q=Tramboory,Zapopan,Jalisco" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-300 transition-colors duration-300"
          >
            Zapopan, Jalisco
          </a>
        </div>
      </div>
      
      {/* Horario */}
      <div className="flex items-center gap-3 group">
        <div className="p-3 bg-indigo-900/50 rounded-lg group-hover:bg-indigo-800/60 transition-colors duration-300">
          <FiClock className="text-xl text-purple-400" />
        </div>
        <div>
          <h4 className="text-sm text-gray-300">Horario</h4>
          <p className="text-white">Lun - Dom: 10:00 - 20:00</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;