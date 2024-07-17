import {Link} from 'react-router-dom';
import Logotipo from '../img/logo.webp';
import {AiOutlineUser} from 'react-icons/ai';

const NavLink = ({to, children, icon}) => (
    <Link to={to}>
        <li className="p-2 rounded-md hidden sm:flex items-center justify-center text-slate-700 hover:bg-orange-600 hover:text-white gap-2">
            {icon && <span>{icon}</span>}
            {children}
        </li>
    </Link>
);

export default function Header() {
    return (
        <header className="flex justify-between items-center bg-white backdrop-blur-md font-funhouse">
            <Link to="/">
                <img src={Logotipo} alt="Tramboory Logo" className="h-16 p-3"/>
            </Link>
            <ul className="flex gap-4 mr-3">
                <NavLink to="/">Inicio</NavLink>
                <NavLink to="/appointments">Haz tu fiesta</NavLink>
                <NavLink to="/signin" icon={<AiOutlineUser/>}>Ingresar</NavLink>
            </ul>
        </header>
    );
}
