import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@/components/axiosConfig'

const useThemesStore = create((set, get) => ({
  // Estado
  themes: [],
  
  // Acciones
  fetchThemes: async () => {
    try {
      const response = await axiosInstance.get('/tematicas')
      set({ themes: response.data })
      return response.data
    } catch (error) {
      console.error('Error al cargar temáticas:', error)
      toast.error('Error al cargar las temáticas')
      throw error
    }
  },
  
  addTheme: async (themeData) => {
    try {
      const response = await axiosInstance.post('/tematicas', themeData)
      set(state => ({ themes: [...state.themes, response.data] }))
      toast.success('Temática creada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al crear temática:', error)
      toast.error('Error al crear la temática')
      throw error
    }
  },
  
  updateTheme: async (id, themeData) => {
    try {
      const response = await axiosInstance.put(`/tematicas/${id}`, themeData)
      set(state => ({
        themes: state.themes.map(theme => 
          theme.id === id ? { ...theme, ...response.data } : theme
        )
      }))
      toast.success('Temática actualizada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar temática:', error)
      toast.error('Error al actualizar la temática')
      throw error
    }
  },
  
  deleteTheme: async (id) => {
    try {
      await axiosInstance.delete(`/tematicas/${id}`)
      set(state => ({
        themes: state.themes.filter(theme => theme.id !== id)
      }))
      toast.success('Temática eliminada con éxito')
    } catch (error) {
      console.error('Error al eliminar temática:', error)
      toast.error('Error al eliminar la temática')
      throw error
    }
  },
  
  // Selectores
  getThemeById: (id) => {
    const { themes } = get()
    return themes.find(theme => theme.id === id)
  }
}))

export default useThemesStore