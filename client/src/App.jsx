import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  Outlet,
  useLocation
} from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiWifiOff } from 'react-icons/fi'
import { FaSadTear } from 'react-icons/fa'
import { Header, Footer } from '@/components/ui/'
import ProtectedRoute from '@/components/ProtectedRoute'
import PublicRoute from '@/components/PublicRoute.jsx'
import Logo from '@/img/logo.webp'
import withTokenValidation from '@/components/withTokenValidation.jsx'
import { AuthProvider } from '@/context/authContext.jsx'
import ProfileForm from '@/pages/customer/profile-service/ProfileForm.jsx'
import { Toaster } from 'react-hot-toast'

// Importaciones perezosas para mejorar el rendimiento
const Home = lazy(() => import('@/pages/public/Home'))
const SignIn = lazy(() => import('@/pages/auth/SignIn'))
const Signup = lazy(() => import('@/pages/auth/SignUp'))
const Dashboard = lazy(() => import('@/pages/admin/dashboard/Dashboard.jsx'))
const Reservation = lazy(() => import('@/pages/customer/reservation/index.jsx'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword.jsx'))
const Appointment = lazy(() => import('@/pages/customer/reservation/Appointment.jsx'))
const PublicAppointment = lazy(() => import('@/pages/public/Appointment.jsx'))
const AboutTramboory = lazy(() => import('@/pages/public/AboutTramboory.jsx'))
const InventoryDashboard = lazy(() => import('@/pages/admin/inventory/InventoryDashboard.jsx'))
const InventoryIndex = lazy(() => import('@/pages/admin/inventory/index.jsx'))
const Cotizaciones = lazy(() => import('@/pages/customer/cotizaciones/index.jsx'))
const ReservationStatus = lazy(() =>
  import('@/pages/customer/reservation/ReservationStatus.jsx')
)

const Layout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
)

// Componente de carga sutil mejorado con mensaje estilizado
const SubtleLoader = () => {
  const [showDots, setShowDots] = useState(false)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [showNetworkAnimation, setShowNetworkAnimation] = useState(false)

  useEffect(() => {
    const dotsTimer = setTimeout(() => {
      setShowDots(true)
    }, 5000) // Mostrar los puntos después de 5 segundos

    const progressBarTimer = setTimeout(() => {
      setShowProgressBar(true)
    }, 10000) // Mostrar la barra de progreso después de 10 segundos

    const networkAnimationTimer = setTimeout(() => {
      setShowNetworkAnimation(true)
    }, 15000) // Mostrar la animación de red después de 15 segundos

    return () => {
      clearTimeout(dotsTimer)
      clearTimeout(progressBarTimer)
      clearTimeout(networkAnimationTimer)
    }
  }, [])

  const containerVariants = {
    start: { opacity: 0 },
    end: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.5 }
    }
  }

  const dotVariants = {
    start: { opacity: 0, y: 20 },
    end: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  }

  const dotTransition = {
    duration: 0.8,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut'
  }

  const progressBarVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const networkAnimationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const wifiVariants = {
    start: { opacity: 0, scale: 0 },
    end: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  }

  const wifiTransition = {
    duration: 2,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut'
  }

  return (
    <div className='fixed inset-0 z-50 flex flex-col justify-center items-center bg-gradient-to-r from-blue-100 to-purple-100'>
      <AnimatePresence>
        {showDots && (
          <motion.div
            className='flex space-x-3 mb-8'
            variants={containerVariants}
            initial='start'
            animate='end'
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                className='w-4 h-4 bg-blue-500 rounded-full shadow-lg'
                variants={dotVariants}
                transition={dotTransition}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProgressBar && (
          <motion.div
            className='bg-white p-6 rounded-lg shadow-lg max-w-md text-center'
            variants={progressBarVariants}
            initial='hidden'
            animate='visible'
            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
          >
            <div className='mt-4 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner'>
              <motion.div
                className='h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full'
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'easeInOut' }}
              />
            </div>
            <p className='mt-4 text-gray-600'>Cargando...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNetworkAnimation && (
          <motion.div
            className='mt-8 bg-white p-6 rounded-lg shadow-lg max-w-md text-center'
            variants={networkAnimationVariants}
            initial='hidden'
            animate='visible'
            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
          >
            <div className='flex flex-col items-center'>
              <motion.div
                className='relative w-32 h-32 mb-4'
                variants={wifiVariants}
                initial='start'
                animate='end'
                transition={wifiTransition}
              >
                <FiWifiOff className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-red-500' />
                <img
                  src={Logo}
                  alt=''
                  className='w-full h-full object-cover rounded-full shadow-lg'
                />
              </motion.div>
              <div className='flex justify-center space-x-4 mb-4'>
                <FaSadTear className='text-4xl text-yellow-500' />
              </div>
              <p className='text-gray-600'>
                Parece que hay problemas de conexión. Por favor, verifica tu
                red.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente de transición de página con animación suave
const PageTransition = ({ children }) => {
  const location = useLocation();
  
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 30
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -30
    }
  };
  
  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 1.2  // Duración más lenta para una transición más suave
  };
  
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

function App () {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
        <Suspense fallback={<SubtleLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Rutas sin Header ni Footer */}
              <Route path='/' element={<PageTransition><Home /></PageTransition>} />
              <Route path='/appointments' element={<PageTransition><PublicAppointment /></PageTransition>} />
              <Route path='/about' element={<PageTransition><AboutTramboory /></PageTransition>} />
            
            {/* Rutas con Header y Footer */}
            <Route element={<Layout />}>
              <Route
                path='/signin'
                element={
                  <PublicRoute>
                    <SignIn />
                  </PublicRoute>
                }
              />
              <Route path='/signup' element={<Signup />} />
              
              <Route
                path='/dashboard'
                element={
                  <ProtectedRoute
                    allowedRoles={['admin']}
                    redirectPath='/signin'
                  >
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/reservations'
                element={
                  <ProtectedRoute
                    allowedRoles={['admin', 'cliente']}
                    redirectPath='/signin'
                  >
                    <Reservation />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/reservation-status/:id'
                element={
                  <ProtectedRoute
                    allowedRoles={['admin', 'cliente']}
                    redirectPath='/signin'
                  >
                    <ReservationStatus />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/customer/cotizaciones'
                element={
                  <ProtectedRoute
                    allowedRoles={['cliente']}
                    redirectPath='/signin'
                  >
                    <Cotizaciones />
                  </ProtectedRoute>
                }
              />

              <Route
                path='/profile'
                element={
                  <ProtectedRoute
                    allowedRoles={['admin', 'cliente']}
                    redirectPath='/signin'
                  >
                    <ProfileForm />
                  </ProtectedRoute>
                }
              />

              <Route path='/forgot-password' element={<ForgotPassword />} />
              
              <Route
                path='/inventory/*'
                element={
                  <ProtectedRoute
                    allowedRoles={['admin', 'inventario']}
                    redirectPath='/signin'
                  >
                    <Suspense fallback={<div className="flex items-center justify-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>}>
                      <InventoryIndex />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path='*' element={<Navigate to='/' />} />
          </Routes>
          </AnimatePresence>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App