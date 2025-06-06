import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@/components/axiosConfig'

const useFoodOptionsStore = create((set, get) => ({
  // Estado
  foodOptions: [],
  
  // Acciones
  fetchFoodOptions: async () => {
    try {
      const response = await axiosInstance.get('/opciones-alimentos')
      set({ foodOptions: response.data })
      return response.data
    } catch (error) {
      console.error('Error al cargar opciones de alimentos:', error)
      toast.error('Error al cargar las opciones de alimentos')
      throw error
    }
  },
  
  addFoodOption: async (foodOptionData) => {
    try {
      const response = await axiosInstance.post('/opciones-alimentos', foodOptionData)
      set(state => ({ foodOptions: [...state.foodOptions, response.data] }))
      toast.success('Opción de alimento creada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al crear opción de alimento:', error)
      toast.error('Error al crear la opción de alimento')
      throw error
    }
  },
  
  updateFoodOption: async (id, foodOptionData) => {
    try {
      const response = await axiosInstance.put(`/opciones-alimentos/${id}`, foodOptionData)
      set(state => ({
        foodOptions: state.foodOptions.map(option => 
          option.id === id ? { ...option, ...response.data } : option
        )
      }))
      toast.success('Opción de alimento actualizada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar opción de alimento:', error)
      toast.error('Error al actualizar la opción de alimento')
      throw error
    }
  },
  
  deleteFoodOption: async (id) => {
    try {
      await axiosInstance.delete(`/opciones-alimentos/${id}`)
      set(state => ({
        foodOptions: state.foodOptions.filter(option => option.id !== id)
      }))
      toast.success('Opción de alimento eliminada con éxito')
    } catch (error) {
      console.error('Error al eliminar opción de alimento:', error)
      toast.error('Error al eliminar la opción de alimento')
      throw error
    }
  },
  
  // Selectores
  getFoodOptionById: (id) => {
    const { foodOptions } = get()
    return foodOptions.find(option => option.id === id)
  },
  
  getActiveFoodOptions: () => {
    const { foodOptions } = get()
    return foodOptions.filter(option => option.activo)
  }
}))

export default useFoodOptionsStore