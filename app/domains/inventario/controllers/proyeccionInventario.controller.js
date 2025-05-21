const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const MateriaPrima = require('../../models/Inventory/MateriaPrima');
const Lote = require('../../models/Inventory/Lote');
const MovimientoInventario = require('../../models/Inventory/MovimientoInventario');
const UnidadMedida = require('../../models/Inventory/UnidadMedida');

/**
 * Controlador para gestionar proyecciones de inventario
 * Proporciona funcionalidad para proyectar niveles de inventario,
 * identificar caducidades y calcular necesidades de reabastecimiento
 */
class ProyeccionInventarioController {
  /**
   * Obtiene proyecciones de inventario para todas las materias primas
   */
  async obtenerProyeccion(req, res) {
    try {
      const { fecha_inicio, fecha_fin, id_materia_prima } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar fecha_inicio y fecha_fin'
        });
      }
      
      // Verificar formato de fechas
      const fechaInicio = new Date(fecha_inicio);
      const fechaFin = new Date(fecha_fin);
      
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido'
        });
      }
      
      // Días para la proyección
      const diasProyeccion = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
      
      // Obtener materias primas (todas o la específica)
      const whereMateriaPrima = { activo: true };
      if (id_materia_prima) {
        whereMateriaPrima.id = id_materia_prima;
      }
      
      const materiasPrimas = await MateriaPrima.findAll({
        where: whereMateriaPrima,
        include: [
          {
            model: UnidadMedida,
            as: 'unidadMedida',
            attributes: ['nombre', 'abreviacion']
          }
        ]
      });
      
      // Proyecciones para cada materia prima
      const proyecciones = await Promise.all(materiasPrimas.map(async (materiaPrima) => {
        // Calcular consumo promedio diario basado en datos históricos (últimos 30 días)
        const consumoPromedio = await this.calcularConsumoPromedioDiario(materiaPrima.id);
        
        // Obtener lotes activos ordenados por fecha de caducidad
        const lotes = await Lote.findAll({
          where: {
            id_materia_prima: materiaPrima.id,
            activo: true,
            cantidad_actual: {
              [Op.gt]: 0
            }
          },
          order: [['fecha_caducidad', 'ASC']]
        });
        
        // Calcular proyección de stock
        const stockActual = parseFloat(materiaPrima.stock_actual);
        const proyeccionStock = Math.max(0, stockActual - (consumoPromedio * diasProyeccion));
        
        // Identificar lotes que caducarán en el período de proyección
        const lotesPorCaducar = lotes.filter(lote => {
          if (!lote.fecha_caducidad) return false;
          const fechaCaducidad = new Date(lote.fecha_caducidad);
          return fechaCaducidad <= fechaFin;
        });
        
        const cantidadPorCaducar = lotesPorCaducar.reduce((total, lote) => 
          total + parseFloat(lote.cantidad_actual), 0);
        
        // Calcular días hasta nivel crítico
        const diasHastaNivelCritico = consumoPromedio > 0 ? 
          Math.floor((stockActual - materiaPrima.stock_minimo) / consumoPromedio) : null;
        
        return {
          id: materiaPrima.id,
          nombre: materiaPrima.nombre,
          stock_actual: stockActual,
          stock_minimo: parseFloat(materiaPrima.stock_minimo),
          unidad_medida: materiaPrima.unidadMedida ? materiaPrima.unidadMedida.nombre : '',
          abreviacion_um: materiaPrima.unidadMedida ? materiaPrima.unidadMedida.abreviacion : '',
          consumo_promedio_diario: consumoPromedio,
          proyeccion_stock: proyeccionStock,
          proyeccion_dias: diasProyeccion,
          alerta_stock: proyeccionStock < materiaPrima.stock_minimo,
          dias_hasta_nivel_critico: diasHastaNivelCritico,
          lotes_por_caducar: lotesPorCaducar.map(l => ({
            id: l.id,
            codigo: l.codigo_lote,
            fecha_caducidad: l.fecha_caducidad,
            cantidad: parseFloat(l.cantidad_actual),
            dias_restantes: l.diasParaCaducidad()
          })),
          cantidad_por_caducar: cantidadPorCaducar,
          fecha_proyeccion: fechaFin.toISOString().split('T')[0]
        };
      }));
      
      res.status(200).json({
        success: true,
        proyecciones,
        meta: {
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          fecha_fin: fechaFin.toISOString().split('T')[0],
          dias: diasProyeccion
        }
      });
    } catch (error) {
      console.error('Error al generar proyecciones de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar proyecciones de inventario',
        error: error.message
      });
    }
  }
  
  /**
   * Calcula la proyección para una materia prima específica
   */
  async obtenerProyeccionMateriaPrima(req, res) {
    try {
      const { id } = req.params;
      const { dias = 30 } = req.query;
      
      const diasProyeccion = parseInt(dias);
      
      if (isNaN(diasProyeccion) || diasProyeccion <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro "dias" debe ser un número positivo'
        });
      }
      
      // Obtener materia prima
      const materiaPrima = await MateriaPrima.findOne({
        where: {
          id,
          activo: true
        },
        include: [
          {
            model: UnidadMedida,
            as: 'unidadMedida',
            attributes: ['nombre', 'abreviacion']
          }
        ]
      });
      
      if (!materiaPrima) {
        return res.status(404).json({
          success: false,
          message: 'Materia prima no encontrada'
        });
      }
      
      // Calcular fechas para proyección
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + diasProyeccion);
      
      // Calcular consumo promedio
      const consumoPromedio = await this.calcularConsumoPromedioDiario(id);
      
      // Obtener lotes
      const lotes = await Lote.findAll({
        where: {
          id_materia_prima: id,
          activo: true,
          cantidad_actual: {
            [Op.gt]: 0
          }
        },
        order: [['fecha_caducidad', 'ASC']]
      });
      
      // Proyección diaria de consumo y stock
      const proyeccionDiaria = [];
      let stockRestante = parseFloat(materiaPrima.stock_actual);
      
      for (let i = 0; i < diasProyeccion; i++) {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + i);
        
        // Identificar lotes que caducan en este día
        const lotesCaducadosHoy = lotes.filter(lote => {
          if (!lote.fecha_caducidad) return false;
          const fechaCaducidad = new Date(lote.fecha_caducidad);
          return (
            fechaCaducidad.getDate() === fecha.getDate() &&
            fechaCaducidad.getMonth() === fecha.getMonth() &&
            fechaCaducidad.getFullYear() === fecha.getFullYear()
          );
        });
        
        const cantidadCaducada = lotesCaducadosHoy.reduce((total, lote) => 
          total + parseFloat(lote.cantidad_actual), 0);
        
        // Restar consumo diario
        stockRestante = Math.max(0, stockRestante - consumoPromedio);
        
        // Restar caducidad (asumiendo que material caducado no se usa)
        stockRestante = Math.max(0, stockRestante - cantidadCaducada);
        
        proyeccionDiaria.push({
          fecha: fecha.toISOString().split('T')[0],
          stock_proyectado: stockRestante,
          consumo: consumoPromedio,
          caducidad: cantidadCaducada,
          alerta: stockRestante < materiaPrima.stock_minimo
        });
      }
      
      // Calcular días hasta nivel crítico
      const diasHastaNivelCritico = consumoPromedio > 0 ? 
        Math.floor((parseFloat(materiaPrima.stock_actual) - parseFloat(materiaPrima.stock_minimo)) / consumoPromedio) : null;
      
      // Calcular proyección final
      const proyeccionFinal = {
        id: materiaPrima.id,
        nombre: materiaPrima.nombre,
        stock_actual: parseFloat(materiaPrima.stock_actual),
        stock_minimo: parseFloat(materiaPrima.stock_minimo),
        unidad_medida: materiaPrima.unidadMedida ? materiaPrima.unidadMedida.nombre : '',
        abreviacion_um: materiaPrima.unidadMedida ? materiaPrima.unidadMedida.abreviacion : '',
        consumo_promedio_diario: consumoPromedio,
        proyeccion_stock: proyeccionDiaria[diasProyeccion - 1].stock_proyectado,
        dias_hasta_nivel_critico: diasHastaNivelCritico,
        lotes: lotes.map(l => ({
          id: l.id,
          codigo: l.codigo_lote,
          fecha_caducidad: l.fecha_caducidad,
          cantidad: parseFloat(l.cantidad_actual),
          dias_para_caducidad: l.diasParaCaducidad()
        })),
        proyeccion_diaria: proyeccionDiaria
      };
      
      res.status(200).json({
        success: true,
        proyeccion: proyeccionFinal
      });
    } catch (error) {
      console.error('Error al generar proyección de materia prima:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar proyección de materia prima',
        error: error.message
      });
    }
  }
  
  /**
   * Genera un informe de materias primas que necesitan reabastecimiento
   */
  async generarInformeReabastecimiento(req, res) {
    try {
      const { dias_proyeccion = 30, umbral_dias = 7 } = req.query;
      
      // Calcular proyecciones para todas las materias primas
      const materiasPrimas = await MateriaPrima.findAll({
        where: { activo: true },
        include: [
          {
            model: UnidadMedida,
            as: 'unidadMedida',
            attributes: ['nombre', 'abreviacion']
          }
        ]
      });
      
      const necesidadesReabastecimiento = [];
      
      for (const materiaPrima of materiasPrimas) {
        const consumoPromedio = await this.calcularConsumoPromedioDiario(materiaPrima.id);
        
        if (consumoPromedio <= 0) continue; // Ignorar si no hay consumo
        
        const stockActual = parseFloat(materiaPrima.stock_actual);
        const stockMinimo = parseFloat(materiaPrima.stock_minimo);
        
        // Días restantes hasta alcanzar stock mínimo
        const diasRestantes = Math.floor((stockActual - stockMinimo) / consumoPromedio);
        
        // Verificar si requiere reabastecimiento pronto
        if (diasRestantes <= parseInt(umbral_dias)) {
          // Calcular cantidad a reabastecer (para cubrir los días de proyección)
          const cantidadReabastecimiento = consumoPromedio * parseInt(dias_proyeccion);
          
          necesidadesReabastecimiento.push({
            id: materiaPrima.id,
            nombre: materiaPrima.nombre,
            stock_actual: stockActual,
            stock_minimo: stockMinimo,
            unidad_medida: materiaPrima.unidadMedida ? materiaPrima.unidadMedida.nombre : '',
            abreviacion_um: materiaPrima.unidadMedida ? materiaPrima.unidadMedida.abreviacion : '',
            consumo_diario: consumoPromedio,
            dias_restantes: diasRestantes,
            cantidad_reabastecimiento: cantidadReabastecimiento.toFixed(2),
            prioridad: diasRestantes <= 0 ? 'Alta' : diasRestantes <= 3 ? 'Media' : 'Baja'
          });
        }
      }
      
      // Ordenar por prioridad (días restantes ascendentes)
      necesidadesReabastecimiento.sort((a, b) => a.dias_restantes - b.dias_restantes);
      
      res.status(200).json({
        success: true,
        necesidades_reabastecimiento: necesidadesReabastecimiento,
        meta: {
          fecha_generacion: new Date().toISOString(),
          dias_proyeccion: parseInt(dias_proyeccion),
          umbral_aviso: parseInt(umbral_dias)
        }
      });
    } catch (error) {
      console.error('Error al generar informe de reabastecimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar informe de reabastecimiento',
        error: error.message
      });
    }
  }
  
  /**
   * Genera alertas de caducidad próxima
   */
  async generarAlertasCaducidad(req, res) {
    try {
      const { dias_alerta = 30 } = req.query;
      
      const lotesPorCaducar = await Lote.findProximosACaducar(parseInt(dias_alerta));
      
      // Agrupar por materia prima para mejor visualización
      const materiaPrimaMap = new Map();
      
      for (const lote of lotesPorCaducar) {
        const idMateriaPrima = lote.id_materia_prima;
        const nombreMateriaPrima = lote.materiaPrima ? lote.materiaPrima.nombre : `Materia Prima ID: ${idMateriaPrima}`;
        
        if (!materiaPrimaMap.has(idMateriaPrima)) {
          materiaPrimaMap.set(idMateriaPrima, {
            id: idMateriaPrima,
            nombre: nombreMateriaPrima,
            lotes: []
          });
        }
        
        materiaPrimaMap.get(idMateriaPrima).lotes.push({
          id: lote.id,
          codigo: lote.codigo_lote,
          fecha_caducidad: lote.fecha_caducidad,
          cantidad: parseFloat(lote.cantidad_actual),
          dias_restantes: lote.diasParaCaducidad(),
          prioridad: lote.diasParaCaducidad() <= 7 ? 'Alta' : 'Media'
        });
      }
      
      // Convertir mapa a array y ordenar lotes por días restantes
      const alertasCaducidad = Array.from(materiaPrimaMap.values());
      alertasCaducidad.forEach(alerta => {
        alerta.lotes.sort((a, b) => a.dias_restantes - b.dias_restantes);
      });
      
      res.status(200).json({
        success: true,
        alertas_caducidad: alertasCaducidad,
        meta: {
          fecha_generacion: new Date().toISOString(),
          dias_alerta: parseInt(dias_alerta)
        }
      });
    } catch (error) {
      console.error('Error al generar alertas de caducidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar alertas de caducidad',
        error: error.message
      });
    }
  }
  
  /**
   * Método auxiliar para calcular consumo promedio diario
   * basado en movimientos históricos
   */
  async calcularConsumoPromedioDiario(idMateriaPrima, dias = 30) {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);
      
      // Obtener suma de salidas en el período
      const resultado = await MovimientoInventario.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_salidas']
        ],
        where: {
          id_materia_prima: idMateriaPrima,
          tipo_movimiento: 'salida',
          fecha: {
            [Op.gte]: fechaInicio
          },
          activo: true
        }
      });
      
      const totalSalidas = resultado && resultado.getDataValue('total_salidas') 
        ? parseFloat(resultado.getDataValue('total_salidas')) 
        : 0;
      
      // Calcular promedio diario
      return totalSalidas / dias;
    } catch (error) {
      console.error('Error al calcular consumo promedio:', error);
      return 0;
    }
  }
}

module.exports = new ProyeccionInventarioController();