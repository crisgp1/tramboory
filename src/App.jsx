import {BrowserRouter, Routes, Route} from "react-router-dom"; // Corregido aquí
import Home from "./pages/Home";
import Appointments from "./pages/Appointments";
import Header from "./components/Header";
import SignIn from "./pages/SignIn";
import Footer from "./components/Footer";
import SignUp from "./pages/SignUp.jsx";
import Reservations from "./pages/Reservations.jsx";

export default function App() { // Modificado para seguir las convenciones de ES6
    return (
        <BrowserRouter>
            <Header/>
            <Routes>

                <Route path="/" element={<Home/>}/>
                <Route path="/appointments" element={<Appointments/>}/>
                <Route path="/signin" element={<SignIn/>}/>
                <Route path="/signup" element={<SignUp/>}/>
                <Route path="/reservations" element={<Reservations/>}/>

            </Routes>
            <Footer/>
        </BrowserRouter>
    );
}