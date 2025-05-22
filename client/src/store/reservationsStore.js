import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@shared/utils/axiosConfig'
import * as socketService from '@/services/socketService'

const useReservationsStore = create((set, get) => ({
  // Estado
  reservations: [],
  selectedReservation: null,
  
  // Acciones
  fetchReservations: async () => {
    try {
      const response = await axiosInstance.get('/reservas')
      set({ reservations: response.data })
      return response.data
    } catch (error) {
      console.error('Error al cargar reservaciones:', error)
      toast.error('Error al cargar las reservaciones')
      throw error
    }
  },
  
  addReservation: async (reservationData) => {
    try {
      // Asegurarse de que id_usuario sea un nÃºmero
      if (reservationData.id_usuario) {
        reservationData.id_usuario = Number(reservationData.id_usuario)
      }
      
      const response = await axiosInstance.post('/reservas', reservationData)
      set(state => ({ reservations: [...state.reservations, response.data] }))
      toast.success('Reserva creada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al crear reservaciÃ³n:', error)
      toast.error('Error al crear la reservaciÃ³n')
      throw error
    }
  },
  
  updateReservation: async (id, reservationData) => {
    try {
      // Asegurarse de que id_usuario sea un nÃºmero
      if (reservationData.id_usuario) {
        reservationData.id_usuario = Number(reservationData.id_usuario)
      }
      
      const response = await axiosInstance.put(`/reservas/${id}`, reservationData)
      set(state => ({
        reservations: state.reservations.map(reservation => 
          reservation.id === id ? { ...reservation, ...response.data } : reservation
        )
      }))
      toast.success('Reserva actualizada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar reservaciÃ³n:', error)
      toast.error('Error al actualizar la reservaciÃ³n')
      throw error
    }
  },
  
  deleteReservation: async (id) => {
    try {
      await axiosInstance.delete(`/reservas/${id}`)
      set(state => ({
        reservations: state.reservations.filter(reservation => reservation.id !== id)
      }))
      toast.success('Reserva desactivada con Ã©xito')
    } catch (error) {
      console.error('Error al desactivar reservaciÃ³n:', error)
      toast.error('Error al desactivar la reservaciÃ³n')
      throw error
    }
  },
  
  setSelectedReservation: (reservation) => set({ selectedReservation: reservation }),
  
  updateReservationStatus: async (id, newStatus) => {
    try {
      const response = await axiosInstance.put(`/reservas/${id}/status`, { estado: newStatus })
      set(state => ({
        reservations: state.reservations.map(reservation => 
          reservation.id === id ? { ...reservation, estado: newStatus } : reservation
        )
      }))
      toast.success('Estado de la reserva actualizado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar estado de la reservaciÃ³n:', error)
      toast.error('Error al actualizar el estado de la reservaciÃ³n')
      throw error
    }
  },
  
  // Socket.io integration
  initSocketListeners: () => {
    const socket = socketService.initSocket()
    
    socketService.subscribe('reserva_creada', (nuevaReserva) => {
      console.log('Reserva creada recibida vÃ­a Socket.IO:', nuevaReserva)
      set(state => {
        // Verificar si la reserva ya existe para evitar duplicados
        const existe = state.reservations.some(r => r.id === nuevaReserva.id)
        if (!existe) {
          toast.success(`Nueva reserva #${nuevaReserva.id} creada`)
          return { reservations: [...state.reservations, nuevaReserva] }
        }
        return state
      })
    })
    
    socketService.subscribe('reserva_actualizada', (reservaActualizada) => {
      console.log('Reserva actualizada recibida vÃ­a Socket.IO:', reservaActualizada)
      set(state => ({ 
        reservations: state.reservations.map(reserva => 
          reserva.id === reservaActualizada.id ? reservaActualizada : reserva
        )
      }))
    })
    
    socketService.subscribe('reserva_eliminada', (data) => {
      console.log('Reserva eliminada recibida vÃ­a Socket.IO:', data)
      set(state => ({ 
        reservations: state.reservations.filter(reserva => reserva.id !== data.id)
      }))
    })
    
    socketService.subscribe('fechas_bloqueadas', (data) => {
      console.log('Fechas bloqueadas recibidas vÃ­a Socket.IO:', data)
      if (data.reservas && Array.isArray(data.reservas)) {
        set(state => {
          const nuevasReservas = [...state.reservations]
          data.reservas.forEach(nuevaReserva => {
            if (!nuevasReservas.some(r => r.id === nuevaReserva.id)) {
              nuevasReservas.push(nuevaReserva)
            }
          })
          return { reservations: nuevasReservas }
        })
      } else {
        // Si no tenemos datos completos, es mÃ¡s seguro recargar todo
        get().fetchReservations()
      }
    })
    
    return () => socketService.disconnect()
  },
  
  // Selectores
  getFilteredReservations: (search) => {
    const { reservations } = get()
    return reservations.filter(
      reservation =>
        reservation.id.toString().includes(search) ||
        (reservation.nombre_festejado &&
          reservation.nombre_festejado
            .toLowerCase()
            .includes(search.toLowerCase()))
    )
  },
  
  getReservationsByMonth: (month, year) => {
    const { reservations } = get()
    return reservations.filter(reservation => {
      // Verificar que la reserva y el campo de fecha existen
      if (!reservation || !reservation.fecha_reserva) return false
      
      // Convertir a objeto Date
      const reservationDate = new Date(reservation.fecha_reserva)
      
      // Asegurarse de que la fecha es vÃ¡lida
      if (isNaN(reservationDate.getTime())) return false
      
      // Comparar tanto mes como aÃ±o
      return reservationDate.getMonth() === month && 
             reservationDate.getFullYear() === year
    })
  },
  
  // FunciÃ³n para desuscribirse de todos los eventos de socket
  cleanupSocketListeners: () => {
    // Desuscribirse de todos los eventos de socket
    socketService.unsubscribe('reserva_creada');
    socketService.unsubscribe('reserva_actualizada');
    socketService.unsubscribe('reserva_eliminada');
    socketService.unsubscribe('fechas_bloqueadas');
  }
}))

export default useReservationsStore
