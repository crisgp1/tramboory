// Servicios del dominio Catálogo - Arquitectura optimizada
export * from './alimentos.service';
export * from './categorias.service'; 
export * from './extras.service';
export * from './mamparas.service';
export * from './paquetes.service';
export * from './tematicas.service';

// Re-exportaciones para compatibilidad
export { default as AlimentosService } from './alimentos.service';
export { default as CategoriasService } from './categorias.service';
export { default as ExtrasService } from './extras.service';
export { default as MamparasService } from './mamparas.service';
export { default as PaquetesService } from './paquetes.service';
export { default as TematicasService } from './tematicas.service';
