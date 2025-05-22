import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@shared/utils/axiosConfig'

const useMamparasStore = create((set, get) => ({
  // Estado
  mamparas: [],
  
  // Acciones
  fetchMamparas: async () => {
    try {
      const response = await axiosInstance.get('/mamparas')
      set({ mamparas: response.data })
      return response.data
    } catch (error) {
      console.error('Error al cargar mamparas:', error)
      toast.error('Error al cargar las mamparas')
      throw error
    }
  },
  
  addMampara: async (mamparaData) => {
    try {
      const response = await axiosInstance.post('/mamparas', mamparaData)
      set(state => ({ mamparas: [...state.mamparas, response.data] }))
      toast.success('Mampara creada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al crear mampara:', error)
      toast.error('Error al crear la mampara')
      throw error
    }
  },
  
  updateMampara: async (id, mamparaData) => {
    try {
      const response = await axiosInstance.put(`/mamparas/${id}`, mamparaData)
      set(state => ({
        mamparas: state.mamparas.map(mampara => 
          mampara.id === id ? { ...mampara, ...response.data } : mampara
        )
      }))
      toast.success('Mampara actualizada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar mampara:', error)
      toast.error('Error al actualizar la mampara')
      throw error
    }
  },
  
  deleteMampara: async (id) => {
    try {
      await axiosInstance.delete(`/mamparas/${id}`)
      set(state => ({
        mamparas: state.mamparas.filter(mampara => mampara.id !== id)
      }))
      toast.success('Mampara eliminada con Ã©xito')
    } catch (error) {
      console.error('Error al eliminar mampara:', error)
      toast.error('Error al eliminar la mampara')
      throw error
    }
  },
  
  // Selectores
  getMamparaById: (id) => {
    const { mamparas } = get()
    return mamparas.find(mampara => mampara.id === id)
  },
  
  getMamparasByTheme: (themeId) => {
    const { mamparas } = get()
    return mamparas.filter(mampara => mampara.id_tematica === themeId)
  },
  
  getActiveMamparas: () => {
    const { mamparas } = get()
    return mamparas.filter(mampara => mampara.activo)
  }
}))

export default useMamparasStore
