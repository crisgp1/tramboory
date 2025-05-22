import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@shared/utils/axiosConfig'

const useExtrasStore = create((set, get) => ({
  // Estado
  extras: [],
  
  // Acciones
  fetchExtras: async () => {
    try {
      const response = await axiosInstance.get('/extras')
      set({ extras: response.data })
      return response.data
    } catch (error) {
      console.error('Error al cargar extras:', error)
      toast.error('Error al cargar los extras')
      throw error
    }
  },
  
  addExtra: async (extraData) => {
    try {
      const response = await axiosInstance.post('/extras', extraData)
      set(state => ({ extras: [...state.extras, response.data] }))
      toast.success('Extra creado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al crear extra:', error)
      toast.error('Error al crear el extra')
      throw error
    }
  },
  
  updateExtra: async (id, extraData) => {
    try {
      const response = await axiosInstance.put(`/extras/${id}`, extraData)
      set(state => ({
        extras: state.extras.map(extra => 
          extra.id === id ? { ...extra, ...response.data } : extra
        )
      }))
      toast.success('Extra actualizado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar extra:', error)
      toast.error('Error al actualizar el extra')
      throw error
    }
  },
  
  deleteExtra: async (id) => {
    try {
      await axiosInstance.delete(`/extras/${id}`)
      set(state => ({
        extras: state.extras.filter(extra => extra.id !== id)
      }))
      toast.success('Extra eliminado con Ã©xito')
    } catch (error) {
      console.error('Error al eliminar extra:', error)
      toast.error('Error al eliminar el extra')
      throw error
    }
  },
  
  // Selectores
  getExtraById: (id) => {
    const { extras } = get()
    return extras.find(extra => extra.id === id)
  },
  
  getActiveExtras: () => {
    const { extras } = get()
    return extras.filter(extra => extra.activo)
  }
}))

export default useExtrasStore
