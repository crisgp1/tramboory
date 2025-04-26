import { create } from 'zustand'
import { toast } from 'react-toastify'
import axiosInstance from '@/components/axiosConfig'

const useFinancesStore = create((set, get) => ({
  // Estado
  finances: [],
  selectedFinance: null,
  
  // Acciones
  fetchFinances: async () => {
    try {
      const response = await axiosInstance.get('/finanzas')
      // Convertir montos a números
      const formattedFinances = response.data.map(finance => ({
        ...finance,
        monto: Number(finance.monto)
      }))
      set({ finances: formattedFinances })
      return formattedFinances
    } catch (error) {
      console.error('Error al cargar finanzas:', error)
      toast.error('Error al cargar las finanzas')
      throw error
    }
  },
  
  addFinance: async (financeData) => {
    try {
      const response = await axiosInstance.post('/finanzas', financeData)
      const newFinance = {
        ...response.data,
        monto: Number(response.data.monto)
      }
      set(state => ({ finances: [...state.finances, newFinance] }))
      toast.success('Registro financiero creado exitosamente')
      return newFinance
    } catch (error) {
      console.error('Error al crear registro financiero:', error)
      toast.error('Error al crear el registro financiero')
      throw error
    }
  },
  
  updateFinance: async (id, financeData) => {
    try {
      const response = await axiosInstance.put(`/finanzas/${id}`, financeData)
      const updatedFinance = {
        ...response.data,
        monto: Number(response.data.monto)
      }
      set(state => ({
        finances: state.finances.map(finance => 
          finance.id === id ? updatedFinance : finance
        )
      }))
      toast.success('Registro financiero actualizado exitosamente')
      return updatedFinance
    } catch (error) {
      console.error('Error al actualizar registro financiero:', error)
      toast.error('Error al actualizar el registro financiero')
      throw error
    }
  },
  
  deleteFinance: async (id) => {
    try {
      await axiosInstance.delete(`/finanzas/${id}`)
      set(state => ({
        finances: state.finances.filter(finance => finance.id !== id)
      }))
      toast.success('Finanza desactivada con éxito')
    } catch (error) {
      console.error('Error al desactivar finanza:', error)
      toast.error('Error al desactivar la finanza')
      throw error
    }
  },
  
  setSelectedFinance: (finance) => set({ selectedFinance: finance }),
  
  downloadFile: async (id, type) => {
    try {
      const response = await axiosInstance.get(
        `/finanzas/${id}/download/${type}`,
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `finanza_${id}_${type}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.success('Archivo descargado con éxito')
    } catch (error) {
      console.error('Error al descargar el archivo:', error)
      toast.error('Error al descargar el archivo')
      throw error
    }
  },
  
  // Selectores
  getFinancesByMonth: (month, year) => {
    const { finances } = get()
    return finances.filter(finance => {
      // Verificar que finance y el campo de fecha existen
      if (!finance || !finance.fecha) return false
      
      // Convertir a objeto Date
      const financeDate = new Date(finance.fecha)
      
      // Asegurarse de que la fecha es válida
      if (isNaN(financeDate.getTime())) return false
      
      // Comparar tanto mes como año
      return financeDate.getMonth() === month && 
             financeDate.getFullYear() === year
    })
  },
  
  // Estadísticas
  getSummaryByMonth: (month, year) => {
    const financesByMonth = get().getFinancesByMonth(month, year)
    
    const ingresos = financesByMonth
      .filter(f => f.tipo === 'ingreso')
      .reduce((sum, f) => sum + f.monto, 0)
    
    const egresos = financesByMonth
      .filter(f => f.tipo === 'egreso')
      .reduce((sum, f) => sum + f.monto, 0)
    
    const saldo = ingresos - egresos
    
    return {
      ingresos,
      egresos,
      saldo,
      count: financesByMonth.length
    }
  },
  
  getSummaryByCategory: (month, year) => {
    const financesByMonth = get().getFinancesByMonth(month, year)
    
    // Agrupar por categoría
    const categorySummary = financesByMonth.reduce((summary, finance) => {
      const categoryId = finance.id_categoria
      const categoryName = finance.categoria?.nombre || 'Sin categoría'
      const categoryColor = finance.categoria?.color || '#000000'
      
      if (!summary[categoryId]) {
        summary[categoryId] = {
          id: categoryId,
          nombre: categoryName,
          color: categoryColor,
          ingresos: 0,
          egresos: 0,
          total: 0
        }
      }
      
      if (finance.tipo === 'ingreso') {
        summary[categoryId].ingresos += finance.monto
        summary[categoryId].total += finance.monto
      } else {
        summary[categoryId].egresos += finance.monto
        summary[categoryId].total -= finance.monto
      }
      
      return summary
    }, {})
    
    return Object.values(categorySummary)
  }
}))

export default useFinancesStore