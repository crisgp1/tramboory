import React from 'react';
import Video from '../videos/background.webm';
import Logo from '../img/logo.webp'; // Asegúrate de cambiar la ruta según corresponda
import Paquetes from './Paquetes';
import Appointments from "./Appointments.jsx";
import {Link} from "react-router-dom";

export default function Home() {
    return (
        <div className='bg-gray-100 min-h-screen flex flex-col justify-center items-center relative overflow-hidden'>
            <video
                src={Video}
                autoPlay
                loop
                muted
                className='absolute z-0 w-full h-full object-cover'
                title="Video de fondo"
                aria-label="Video que muestra imágenes de eventos"
            />

            <div className="z-10 relative flex flex-col items-center">
                <img src={Logo} className='h-20 mb-7' alt='Logo de la empresa'/>
                <h1 className='text-4xl font-bold text-center text-white hover:text-blue-200 transition-all duration-300 font-funhouse'>
                    <Link to="/appointments"> Cotiza tu evento </Link>
                </h1>
            </div>

            <div className="z-20 relative">

            </div>
        </div>
    );
}
