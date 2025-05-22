import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@shared/utils/axiosConfig'

const usePaymentsStore = create((set, get) => ({
  // Estado
  payments: [],
  selectedPayment: null,
  
  // Acciones
  fetchPayments: async () => {
    try {
      const response = await axiosInstance.get('/pagos')
      set({ payments: response.data })
      return response.data
    } catch (error) {
      console.error('Error al cargar pagos:', error)
      toast.error('Error al cargar los pagos')
      throw error
    }
  },
  
  addPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post('/pagos', paymentData)
      set(state => ({ payments: [...state.payments, response.data] }))
      toast.success('Pago creado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al crear pago:', error)
      toast.error('Error al crear el pago')
      throw error
    }
  },
  
  updatePayment: async (id, paymentData) => {
    try {
      const response = await axiosInstance.put(`/pagos/${id}`, paymentData)
      set(state => ({
        payments: state.payments.map(payment => 
          payment.id === id ? { ...payment, ...response.data } : payment
        )
      }))
      toast.success('Pago actualizado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar pago:', error)
      toast.error('Error al actualizar el pago')
      throw error
    }
  },
  
  deletePayment: async (id) => {
    try {
      await axiosInstance.delete(`/pagos/${id}`)
      set(state => ({
        payments: state.payments.filter(payment => payment.id !== id)
      }))
      toast.success('Pago eliminado con Ã©xito')
    } catch (error) {
      console.error('Error al eliminar pago:', error)
      toast.error('Error al eliminar el pago')
      throw error
    }
  },
  
  updatePaymentStatus: async (id, newStatus) => {
    try {
      const response = await axiosInstance.put(`/pagos/${id}/status`, {
        estado: newStatus
      })
      
      set(state => ({
        payments: state.payments.map(payment => 
          payment.id === id ? { ...payment, estado: newStatus } : payment
        )
      }))
      
      toast.success('Estado del pago actualizado con Ã©xito')
      return response.data
    } catch (error) {
      console.error('Error al actualizar el estado del pago:', error)
      toast.error('Error al actualizar el estado del pago')
      throw error
    }
  },
  
  setSelectedPayment: (payment) => set({ selectedPayment: payment }),
  
  // Selectores
  getPaymentById: (id) => {
    const { payments } = get()
    return payments.find(payment => payment.id === id)
  },
  
  getPaymentsByReservation: (reservationId) => {
    const { payments } = get()
    return payments.filter(payment => payment.id_reserva === reservationId)
  },
  
  getPaymentsByStatus: (status) => {
    const { payments } = get()
    return payments.filter(payment => payment.estado === status)
  },
  
  getPaymentsByMonth: (month, year) => {
    const { payments } = get()
    return payments.filter(payment => {
      if (!payment || !payment.fecha) return false
      
      const paymentDate = new Date(payment.fecha)
      
      if (isNaN(paymentDate.getTime())) return false
      
      return paymentDate.getMonth() === month && 
             paymentDate.getFullYear() === year
    })
  },
  
  // EstadÃ­sticas
  getPaymentsSummary: () => {
    const { payments } = get()
    
    const total = payments.reduce((sum, payment) => sum + Number(payment.monto), 0)
    
    const byStatus = payments.reduce((summary, payment) => {
      const status = payment.estado
      
      if (!summary[status]) {
        summary[status] = {
          count: 0,
          total: 0
        }
      }
      
      summary[status].count++
      summary[status].total += Number(payment.monto)
      
      return summary
    }, {})
    
    return {
      total,
      count: payments.length,
      byStatus
    }
  }
}))

export default usePaymentsStore
