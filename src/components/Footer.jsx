import Logo from '../img/logo.webp';

export default function Footer() {
    return (
        <footer className="bg-blue-800 p-4">
            <div className="container mx-auto text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-center items-center">
                    <img src={Logo} alt="Logo" className="w-32 mb-4 md:mb-0 md:mr-4"/>
                    <p className="text-white">Todos los derechos reservados &copy; 2024</p>
                </div>
            </div>
        </footer>
    );
}
