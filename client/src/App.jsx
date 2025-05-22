import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  Outlet,
  useLocation,
} from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiWifiOff } from 'react-icons/fi'
import { FaSadTear } from 'react-icons/fa'
import { Header, Footer } from '@shared/components/'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import PublicRoute from '@shared/components/PublicRoute'
import Logo from './img/logo.webp' // <- ruta corregida
import { AuthProvider } from '@shared/context/authContext'
import ThemeProvider from '@shared/context/ThemeProvider' // <- import correcto
import ProfileForm from '@domains/usuario/pages/customer/ProfileForm' // <- ruta corregida
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// importaciones perezosas (lazy loading) para optimizar el bundle
const Home = lazy(() => import('@domains/public/pages/Home'))
const PublicHomeContainer = lazy(
  () => import('@domains/public/pages/PublicHomeContainer'),
)
const SignIn = lazy(() => import('@domains/auth/pages/SignIn'))
const Signup = lazy(() => import('@domains/auth/pages/SignUp'))
const Dashboard = lazy(() => import('@domains/dashboard/pages/Dashboard'))
const Reservation = lazy(() => import('@domains/reservas/pages/customer/index'))
const ForgotPassword = lazy(() => import('@domains/auth/pages/ForgotPassword'))
const Appointment = lazy(() => import('@domains/reservas/pages/customer/Appointment'))
const PublicAppointment = lazy(() => import('@domains/public/pages/Appointment'))
const AboutTramboory = lazy(() => import('@domains/public/pages/AboutTramboory'))
const InventoryDashboard = lazy(() => import('@domains/inventario/pages/InventoryDashboard'))
const InventoryIndex = lazy(() => import('@domains/inventario/pages/index'))
const Cotizaciones = lazy(() => import('@domains/cotizaciones/pages/index'))
const ReservationStatus = lazy(() =>
  import('@domains/reservas/pages/customer/ReservationStatus'),
)

/* -------------------------------------------------------------------------- */
/*                                    UI                                     */
/* -------------------------------------------------------------------------- */

const Layout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
)

// loader animado (progressive UX)
const SubtleLoader = () => {
  const [showDots, setShowDots] = useState(false)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [showNetworkAnimation, setShowNetworkAnimation] = useState(false)

  useEffect(() => {
    const dotsTimer = setTimeout(() => setShowDots(true), 5_000)
    const progressBarTimer = setTimeout(() => setShowProgressBar(true), 10_000)
    const networkAnimationTimer = setTimeout(() => setShowNetworkAnimation(true), 15_000)

    return () => {
      clearTimeout(dotsTimer)
      clearTimeout(progressBarTimer)
      clearTimeout(networkAnimationTimer)
    }
  }, [])

  const containerVariants = {
    start: { opacity: 0 },
    end: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.5 } },
  }

  const dotVariants = {
    start: { opacity: 0, y: 20 },
    end: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  }

  const dotTransition = { duration: 0.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }

  const progressBarVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  const wifiVariants = {
    start: { opacity: 0, scale: 0 },
    end: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  }

  const wifiTransition = { duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100'>
      {/* puntos */}
      <AnimatePresence>
        {showDots && (
          <motion.div
            className='mb-8 flex space-x-3'
            variants={containerVariants}
            initial='start'
            animate='end'
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {[...Array(3)].map((_, idx) => (
              <motion.div
                key={idx}
                className='h-4 w-4 rounded-full bg-blue-500 shadow-lg'
                variants={dotVariants}
                transition={dotTransition}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* progress bar */}
      <AnimatePresence>
        {showProgressBar && (
          <motion.div
            className='max-w-md rounded-lg bg-white p-6 text-center shadow-lg'
            variants={progressBarVariants}
            initial='hidden'
            animate='visible'
            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
          >
            <div className='mt-4 h-2 overflow-hidden rounded-full bg-gray-200 shadow-inner'>
              <motion.div
                className='h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500'
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'easeInOut' }}
              />
            </div>
            <p className='mt-4 text-gray-600'>Cargando…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* red caída */}
      <AnimatePresence>
        {showNetworkAnimation && (
          <motion.div
            className='mt-8 max-w-md rounded-lg bg-white p-6 text-center shadow-lg'
            variants={progressBarVariants}
            initial='hidden'
            animate='visible'
            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
          >
            <div className='flex flex-col items-center'>
              <motion.div
                className='relative mb-4 h-32 w-32'
                variants={wifiVariants}
                initial='start'
                animate='end'
                transition={wifiTransition}
              >
                <FiWifiOff className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl text-red-500' />
                <img src={Logo} alt='Logo Tramboory' className='h-full w-full rounded-full object-cover shadow-lg' />
              </motion.div>
              <FaSadTear className='mb-4 text-4xl text-yellow-500' />
              <p className='text-gray-600'>Parece que hay problemas de conexión. Verifica tu red.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// transición suave entre páginas
const PageTransition = ({ children }) => {
  const location = useLocation()

  const pageVariants = {
    initial: { opacity: 0, y: 30 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -30 },
  }

  const pageTransition = { type: 'tween', ease: 'easeInOut', duration: 1.2 }

  return (
    <motion.div
      key={location.pathname}
      initial='initial'
      animate='in'
      exit='out'
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   APP                                      */
/* -------------------------------------------------------------------------- */

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ToastContainer
            position='top-right'
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='light'
          />

          <Suspense fallback={<SubtleLoader />}>
            <AnimatePresence mode='wait'>
              <Routes>
                {/* rutas públicas sin header/footer */}
                <Route path='/' element={<PageTransition><PublicHomeContainer /></PageTransition>} />
                <Route path='/appointments' element={<PageTransition><PublicAppointment /></PageTransition>} />
                <Route path='/about' element={<PageTransition><AboutTramboory /></PageTransition>} />

                {/* rutas con layout */}
                <Route element={<Layout />}>
                  {/* auth */}
                  <Route
                    path='/signin'
                    element={
                      <PublicRoute>
                        <SignIn />
                      </PublicRoute>
                    }
                  />
                  <Route path='/signup' element={<Signup />} />
                  <Route path='/forgot-password' element={<ForgotPassword />} />

                  {/* dashboard */}
                  <Route
                    path='/dashboard'
                    element={
                      <ProtectedRoute allowedRoles={['admin']} redirectPath='/signin'>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* reservas */}
                  <Route
                    path='/reservations'
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'cliente']} redirectPath='/signin'>
                        <Reservation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/reservation-status/:id'
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'cliente']} redirectPath='/signin'>
                        <ReservationStatus />
                      </ProtectedRoute>
                    }
                  />

                  {/* cotizaciones */}
                  <Route
                    path='/customer/cotizaciones'
                    element={
                      <ProtectedRoute allowedRoles={['cliente']} redirectPath='/signin'>
                        <Cotizaciones />
                      </ProtectedRoute>
                    }
                  />

                  {/* perfil */}
                  <Route
                    path='/profile'
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'cliente']} redirectPath='/signin'>
                        <ProfileForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* inventario */}
                  <Route
                    path='/inventory/*'
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'inventario']} redirectPath='/signin'>
                        <Suspense
                          fallback={
                            <div className='flex h-screen items-center justify-center'>
                              <span className='loading loading-spinner loading-lg' />
                            </div>
                          }
                        >
                          <InventoryIndex />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* catch-all */}
                <Route path='*' element={<Navigate to='/' />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
