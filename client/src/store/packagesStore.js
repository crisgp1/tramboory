import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@/components/axiosConfig'

const usePackagesStore = create((set, get) => ({
  // Estado
  packages: [],
  
  // Acciones
  fetchPackages: async () => {
    try {
      const response = await axiosInstance.get('/paquetes')
      set({ packages: response.data })
      return response.data
    } catch (error) {
      console.error('Error al cargar paquetes:', error)
      toast.error('Error al cargar los paquetes')
      throw error
    }
  },
  
  addPackage: async (packageData) => {
    try {
      const response = await axiosInstance.post('/paquetes', packageData)
      set(state => ({ packages: [...state.packages, response.data] }))
      toast.success('Paquete creado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al crear paquete:', error)
      toast.error('Error al crear el paquete')
      throw error
    }
  },
  
  updatePackage: async (id, packageData) => {
    try {
      const response = await axiosInstance.put(`/paquetes/${id}`, packageData)
      set(state => ({
        packages: state.packages.map(pkg => 
          pkg.id === id ? { ...pkg, ...response.data } : pkg
        )
      }))
      toast.success('Paquete actualizado exitosamente')
      return response.data
    } catch (error) {
      console.error('Error al actualizar paquete:', error)
      toast.error('Error al actualizar el paquete')
      throw error
    }
  },
  
  deletePackage: async (id) => {
    try {
      await axiosInstance.delete(`/paquetes/${id}`)
      set(state => ({
        packages: state.packages.filter(pkg => pkg.id !== id)
      }))
      toast.success('Paquete desactivado con éxito')
    } catch (error) {
      console.error('Error al desactivar paquete:', error)
      toast.error('Error al desactivar el paquete')
      throw error
    }
  },
  
  // Selectores
  getPackageById: (id) => {
    const { packages } = get()
    return packages.find(pkg => pkg.id === id)
  },
  
  getActivePackages: () => {
    const { packages } = get()
    return packages.filter(pkg => pkg.activo)
  }
}))

export default usePackagesStore