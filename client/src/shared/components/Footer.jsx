import Logo from '../../img/logo.webp';

export const Footer = () => {
  return (
    <footer className="bg-blue-800 py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <img src={Logo} alt="" className="w-32 mr-4" />
          </div>
          <p className="text-white text-sm">
            Todos los derechos reservados &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};