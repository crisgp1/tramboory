import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@shared/utils/axiosConfig'

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
      console.error('Error al cargar temÃ¡ticas:', error)
      toast.error('Error al cargar las temÃ¡ticas')
      throw error
    }
  },
  
  addTheme: async (themeData) => {
    try {
      const response = await axiosInstance.post('/tematicas', themeData)
      set(state => ({ themes: [...state.themes, response.data] }))
      toast.success('TemÃ¡tica creada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al crear temÃ¡tica:', error)
      toast.error('Error al crear la temÃ¡tica')
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
      toast.success('TemÃ¡tica actualizada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar temÃ¡tica:', error)
      toast.error('Error al actualizar la temÃ¡tica')
      throw error
    }
  },
  
  deleteTheme: async (id) => {
    try {
      await axiosInstance.delete(`/tematicas/${id}`)
      set(state => ({
        themes: state.themes.filter(theme => theme.id !== id)
      }))
      toast.success('TemÃ¡tica eliminada con Ã©xito')
    } catch (error) {
      console.error('Error al eliminar temÃ¡tica:', error)
      toast.error('Error al eliminar la temÃ¡tica')
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
