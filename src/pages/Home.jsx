import React from 'react';
import Video from '../videos/background.webm';
import Logo from '../img/logo.webp'; // Asegúrate de cambiar la ruta según corresponda
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className='bg-gray-100 min-h-screen flex flex-col relative overflow-hidden'>
            <div className='relative w-full h-screen flex flex-col justify-center items-center'>
                <video
                    src={Video}
                    autoPlay
                    loop
                    muted
                    className='absolute inset-0 z-0 w-full h-full object-cover'
                    title="Video de fondo"
                    aria-label="Video que muestra imágenes de eventos"
                />

                <div className="z-10 relative flex flex-col items-center">
                    <img src={Logo} className='h-20 mb-7' alt='Logo de la empresa'/>
                    <h1 className='text-4xl font-bold text-center text-white hover:text-blue-200 transition-all duration-300 font-funhouse'>
                        <Link to="/appointments"> Cotiza tu evento </Link>
                    </h1>
                </div>
            </div>

            <div className="z-20 relative bg-white w-full p-8">
                {/* Aquí puedes agregar más contenido */}
                <p className='text-gray-700'>
                    Bienvenido a nuestra página. Aquí puedes cotizar tu evento y conocer más sobre nuestros servicios.
                </p>
            </div>
        </div>
    );
}
