import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@/components/axiosConfig'

const useUsersStore = create((set, get) => ({
  // Estado
  users: [],
  selectedUser: null,
  
  // Acciones
  fetchUsers: async () => {
    try {
      const response = await axiosInstance.get('/usuarios')
      set({ users: response.data })
      return response.data
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      toast.error('Error al cargar los usuarios')
      throw error
    }
  },
  
  addUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/usuarios', userData)
      set(state => ({ users: [...state.users, response.data] }))
      toast.success('Usuario creado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al crear usuario:', error)
      toast.error('Error al crear usuario')
      throw error
    }
  },
  
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/usuarios/${id}`, userData)
      set(state => ({
        users: state.users.map(user => 
          user.id === id ? { ...user, ...response.data } : user
        )
      }))
      toast.success('Usuario actualizado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      toast.error('Error al actualizar usuario')
      throw error
    }
  },
  
  deleteUser: async (id) => {
    try {
      await axiosInstance.delete(`/usuarios/${id}`)
      set(state => ({
        users: state.users.filter(user => user.id !== id)
      }))
      toast.success('Usuario desactivado con éxito')
    } catch (error) {
      console.error('Error al desactivar usuario:', error)
      toast.error('Error al desactivar usuario')
      throw error
    }
  },
  
  setSelectedUser: (user) => set({ selectedUser: user }),
  
  // Selectores
  getFilteredUsers: (search) => {
    const { users } = get()
    return users.filter(
      user =>
        user.nombre.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.id_personalizado &&
          user.id_personalizado
            .toLowerCase()
            .includes(search.toLowerCase()))
    )
  }
}))

export default useUsersStore