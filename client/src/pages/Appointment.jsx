import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiCalendar, FiClock, FiGift, FiUsers, FiMusic, FiCoffee, FiSmile, FiStar } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

function CategorySection({ title, children, index }) {
    const sectionRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(sectionRef.current,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom-=100",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, []);

    return (
        <div 
            ref={sectionRef}
            className="my-10 p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl"
        >
            <h3 className="text-3xl font-bold text-white mb-6 font-funhouse">{title}</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {React.Children.map(children, (child, i) => 
                    React.cloneElement(child, { delay: i * 0.2 + index * 0.5 })
                )}
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }) {
    const cardRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                delay,
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: "top bottom-=50",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, [delay]);

    return (
        <div 
            ref={cardRef}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
            <span className="block w-16 h-16 mx-auto text-indigo-500 mb-4" role="img" aria-label={title}>
                {icon}
            </span>
            <h4 className="mt-4 text-xl font-bold text-gray-900 font-funhouse">{title}</h4>
            {description && <p className="mt-2 text-base text-gray-600 kalam">{description}</p>}
        </div>
    );
}

export default function Appointment() {
    const headerRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(headerRef.current.children,
            { opacity: 0, y: -50 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.2 }
        );

        gsap.fromTo(ctaRef.current,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: "top bottom-=100",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, []);

    return (
        <section className="min-h-screen bg-gradient-to-b from-purple-100 to-indigo-200 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div ref={headerRef} className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-indigo-800 sm:text-5xl mb-4 font-funhouse">
                        Descubre la Magia de Tramboory
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto kalam">
                        Explora nuestros paquetes llenos de diversión y crea momentos inolvidables para tu celebración especial.
                    </p>
                </div>

                <CategorySection title="Servicios Básicos" index={0}>
                    <FeatureCard
                        icon={<FiClock className="w-full h-full" />}
                        title="4 Horas de Diversión"
                        description="3.5 horas de salón + 30 min de despedida."
                    />
                    <FeatureCard
                        icon={<FiCalendar className="w-full h-full" />}
                        title="Invitación Digital"
                        description="Invitación personalizada para tu evento."
                    />
                    <FeatureCard
                        icon={<FiGift className="w-full h-full" />}
                        title="Decoración Temática"
                        description="Ambientación Tramboory para tu fiesta."
                    />
                </CategorySection>

                <CategorySection title="Alimentos y Bebidas" index={1}>
                    <FeatureCard
                        icon={<FiUsers className="w-full h-full" />}
                        title="Menú Completo"
                        description="Alimentos para niños y adultos."
                    />
                    <FeatureCard
                        icon={<FiCoffee className="w-full h-full" />}
                        title="Bebidas Ilimitadas"
                        description="Refrescos, agua y café de cortesía."
                    />
                </CategorySection>

                <CategorySection title="Entretenimiento" index={2}>
                    <FeatureCard
                        icon={<FiSmile className="w-full h-full" />}
                        title="Área de Juegos"
                        description="Ludoteca y alberca de pelotas."
                    />
                    <FeatureCard
                        icon={<FiMusic className="w-full h-full" />}
                        title="Ambiente Festivo"
                        description="Música y anfitriones para animar."
                    />
                    <FeatureCard
                        icon={<FiStar className="w-full h-full" />}
                        title="Coordinador de Evento"
                        description="Personal dedicado para tu celebración."
                    />
                </CategorySection>

                <div ref={ctaRef} className="text-center mt-16">
                    <Link
                        to="/signin"
                        className="inline-block px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition duration-300 text-lg"
                    >
                        Reserva tu Experiencia Ahora
                    </Link>
                </div>
            </div>
        </section>
    );
}