
// Componente para mostrar cada categoría
function CategorySection({ title, children }) {
    return (
        <div className="my-10 p-6 bg-gradient-to-br from-blue-200 to-blue-100 rounded-xl shadow-xl">
            <h3 className="text-3xl font-bold text-white mb-6">{title}</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </div>
        </div>
    );
}

// Componente para mostrar cada característica o servicio
function FeatureCard({ emoji, title, description }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform duration-200 ease-in-out">
            <span className="block w-20 h-20 mx-auto text-gray-400 sm:mx-0 text-6xl" role="img" aria-label={title}>{emoji}</span>
            <h4 className="mt-4 text-xl font-bold text-gray-900">{title}</h4>
            {description && <p className="mt-2 text-base text-gray-600">{description}</p>}
        </div>
    );
}

// Componente principal que organiza todo en secciones
export default function Paquete() {
    return (
        <section className="bg-bg-tramboory py-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl text-white">¿Qué incluye tu paquete?</h2>
                </div>
                <CategorySection title="Servicios Básicos">
                    <FeatureCard
                        emoji="🕒"
                        title="3.5 horas de salón + 30 min despedida"
                        description="4 horas en total de diversión garantizada."
                    />
                    <FeatureCard
                        emoji="📜"
                        title="Invitación digital Tramboory"
                    />
                    <FeatureCard
                        emoji="🎈"
                        title="Decoración Tramboory"
                    />
                </CategorySection>
                <CategorySection title="Alimentos y Bebidas">
                    <FeatureCard
                        emoji="🍽️"
                        title="Alimento para niños y adultos"
                    />
                    <FeatureCard
                        emoji="🥤"
                        title="Refresco de refill"
                        description="Horchata, Coca-Cola, Sprite, Fanta, agua natural."
                    />
                    <FeatureCard
                        emoji="☕"
                        title="Café refill"
                    />
                </CategorySection>
                <CategorySection title="Entretenimiento">
                    <FeatureCard
                        emoji="🎮"
                        title="Ludoteca"
                    />
                    <FeatureCard
                        emoji="🎳"
                        title="Alberca de pelotas"
                    />
                    <FeatureCard
                        emoji="🎤"
                        title="Anfitriones"
                    />
                    <FeatureCard
                        emoji="🎶"
                        title="Música"
                    />
                    <FeatureCard
                        emoji="👨‍💼"
                        title="Coordinador de evento"
                    />
                </CategorySection>
                <CategorySection title="Comodidades Adicionales">
                    <FeatureCard
                        emoji="🛝"
                        title="Resbaladilla gigante"
                    />
                    <FeatureCard
                        emoji="🌀"
                        title="Laberinto"
                    />
                    <FeatureCard
                        emoji="🤾"
                        title="Trampolines"
                    />
                    <FeatureCard
                        emoji="🏀"
                        title="Mini cancha de basketball"
                    />
                    <FeatureCard
                        emoji="🎉"
                        title="Área de mañanitas"
                    />
                    <FeatureCard
                        emoji="📸"
                        title="Cabinas fotográficas"
                    />
                    <FeatureCard
                        emoji="❄️"
                        title="Aire acondicionado"
                    />
                    <FeatureCard
                        emoji="⚽"
                        title="Futbolito"
                    />
                </CategorySection>
            </div>
        </section>
    );
}

