import { BrowserRouter as Router, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, Footer } from './components/ui/';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from "./components/PublicRoute.jsx";

// Importaciones perezosas para mejorar el rendimiento
const Home = lazy(() => import('./pages/Home'));
const SignIn = lazy(() => import('./pages/SignIn'));
const Signup = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard/index.jsx'));
const Reservation = lazy(() => import('./pages/Reservation'));
const PaquetesPersonalizaciones = lazy(() => import("./pages/PaquetesPersonalizaciones.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const Appointment = lazy(() => import("./pages/Appointment.jsx"));

// Componente Layout que incluye el Header y Footer
const Layout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

// Componente de carga sutil mejorado con mensaje estilizado
const SubtleLoader = () => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    start: { opacity: 0 },
    end: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const dotVariants = {
    start: { opacity: 0, scale: 0.5 },
    end: { opacity: 1, scale: 1 }
  };

  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut'
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-gradient-to-r from-blue-100 to-purple-100">
      <motion.div
        className="flex space-x-3 mb-8"
        variants={containerVariants}
        initial="start"
        animate="end"
      >
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-blue-500 rounded-full"
            variants={dotVariants}
            transition={dotTransition}
          />
        ))}
      </motion.div>
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Estamos casi listos...
            </h3>
            <p className="text-gray-600">
              La carga está tardando un poco más de lo esperado. Gracias por tu paciencia.
            </p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Suspense fallback={<SubtleLoader />}>
        <Routes>
          {/* Rutas sin Header ni Footer */}
          <Route path="/" element={<Home />} />
          <Route path="/appointments" element={<Appointment />} />

          {/* Rutas con Header y Footer */}
          <Route element={<Layout />}>
            <Route path="/signin" element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            } />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/reservations" element={
              <ProtectedRoute>
                <Reservation />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/paquetes" element={
              <ProtectedRoute>
                <PaquetesPersonalizaciones />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;