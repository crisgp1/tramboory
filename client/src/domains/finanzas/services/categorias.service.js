import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@shared/utils/axiosConfig'

const useCategoriesStore = create((set, get) => ({
  // Estado
  categories: [],
  
  // Acciones
  fetchCategories: async () => {
    try {
      const response = await axiosInstance.get('/categorias')
      set({ categories: response.data })
      return response.data
    } catch (error) {
      console.error('Error al cargar categorÃ­as:', error)
      
      // No mostrar toast para errores 404 (recurso no encontrado)
      if (error.response?.status !== 404) {
        toast.error('Error al cargar las categorÃ­as')
      }
      
      throw error
    }
  },
  
  addCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post('/categorias', {
        nombre: categoryData.nombre,
        color: categoryData.color || '#000000'
      })
      set(state => ({ categories: [...state.categories, response.data] }))
      toast.success('CategorÃ­a aÃ±adida con Ã©xito')
      return response.data
    } catch (error) {
      console.error('Error al aÃ±adir la categorÃ­a:', error)
      toast.error('Error al aÃ±adir la categorÃ­a')
      throw error
    }
  },
  
  updateCategory: async (id, categoryData) => {
    try {
      const response = await axiosInstance.put(`/categorias/${id}`, categoryData)
      set(state => ({
        categories: state.categories.map(category =>
          category.id === id ? { ...category, ...response.data } : category
        )
      }))
      toast.success('CategorÃ­a actualizada exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar categorÃ­a:', error)
      toast.error('Error al actualizar la categorÃ­a')
      throw error
    }
  },
  
  deleteCategory: async (id) => {
    try {
      await axiosInstance.delete(`/categorias/${id}`)
      set(state => ({
        categories: state.categories.filter(category => category.id !== id)
      }))
      toast.success('CategorÃ­a eliminada con Ã©xito')
    } catch (error) {
      console.error('Error al eliminar categorÃ­a:', error)
      toast.error('Error al eliminar la categorÃ­a')
      throw error
    }
  },
  
  // Selectores
  getCategoryById: (id) => {
    const { categories } = get()
    return categories.find(category => category.id === id)
  },
  
  getCategoryByName: (name) => {
    const { categories } = get()
    return categories.find(category => 
      category.nombre.toLowerCase() === name.toLowerCase()
    )
  }
}))

export default useCategoriesStore
