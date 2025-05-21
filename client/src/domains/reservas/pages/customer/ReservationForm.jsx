import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWatch } from 'react-hook-form'; 
import { FiCheck } from 'react-icons/fi';
import { isTuesday } from 'date-fns';
import { 
  TIME_SLOTS, 
  TUESDAY_SURCHARGE,
  formatReservationForApi, 
  formatReservationForEditing 
} from '@/utils/reservationUtils';

// Import all section components
import PackageSection from './reservationform/PackageSection';
import FoodOptionsSection from './reservationform/FoodOptionsSection';
import DateTimeSection from './reservationform/DateTimeSection';
import ThemeSection from './reservationform/ThemeSection';
import MamparaSection from './reservationform/MamparaSection';
import ExtrasSection from './reservationform/ExtrasSection';
import CelebrantSection from './reservationform/CelebrantSection';
import CommentsSection from './reservationform/CommentsSection';
const ReservationForm = ({
  onSubmit,
  handleSubmit,
  packages,
  foodOptions,
  tematicas,
  mamparas,
  extras,
  unavailableDates,
  existingReservations,
  control,
  setValue,
  errors,
  watch,
  setIsTuesdayModalOpen,
  editingReservation = null // Nueva prop para manejar edición
}) => {
  // Efecto para inicializar el formulario cuando hay una reserva en edición
  useEffect(() => {
    if (editingReservation) {
      console.log('Inicializando formulario para edición:', editingReservation);
      
      // Transformar datos para edición usando la función común
      const formattedData = formatReservationForEditing(
        editingReservation,
        foodOptions,
        tematicas,
        mamparas
      );
      
      // Reiniciar todos los campos del formulario con los datos formateados
      Object.keys(formattedData).forEach(field => {
        if (field !== 'extras') { // Extras requiere manejo especial
          setValue(field, formattedData[field]);
        }
      });
      
      // Manejar extras especialmente para preservar cantidades
      if (formattedData.extras?.length) {
        setValue('extras', formattedData.extras);
      }
      
      console.log('Datos formateados para edición:', formattedData);
    }
  }, [editingReservation, foodOptions, tematicas, mamparas, setValue]);
  // Memoize form values
  const formValues = useWatch({ control });
  
  // Wrapper para la función onSubmit que transforma los datos para la API
  const handleFormSubmit = useCallback((data) => {
    // Transformar los datos al formato esperado por la API usando la función común
    const apiData = formatReservationForApi(data);
    
    // Llamar a la función onSubmit original con los datos transformados
    onSubmit(apiData);
  }, [onSubmit]);
  
  // Memoize filtered mamparas con compatibilidad para objetos complejos
  const filteredMamparas = useMemo(() => {
    // Extraer el ID de temática (puede ser un objeto complejo o un ID directo)
    const themeId = typeof formValues.id_tematica === 'object'
      ? formValues.id_tematica?.value
      : formValues.id_tematica;
    
    // Usar Number() para asegurar comparación numérica consistente
    return themeId
      ? mamparas.filter(m => Number(m.id_tematica) === Number(themeId) && m.activo)
      : [];
  }, [formValues.id_tematica, mamparas]);
  // Memoize package price calculation
  const calculatePackagePrice = useCallback((packageId, date) => {
    if (!packageId || !date || !(date instanceof Date)) return 0;
    
    const selectedPkg = packages.find(pkg => pkg.id === packageId);
    if (!selectedPkg) return 0;

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek >= 5;
    const basePrice = isWeekend 
      ? parseFloat(selectedPkg.precio_viernes_domingo)
      : parseFloat(selectedPkg.precio_lunes_jueves);
    
    return basePrice + (isTuesday(date) ? TUESDAY_SURCHARGE : 0);
  }, [packages]);

  // Memoize food option price con compatibilidad para objetos complejos
  const getFoodOptionPrice = useCallback((foodOption) => {
    if (!foodOption) return 0;
    
    // Si es un objeto complejo, usar su precio_extra directo o buscar por id.value
    if (typeof foodOption === 'object') {
      if (foodOption.precio_extra) {
        return parseFloat(foodOption.precio_extra);
      }
      const optionId = foodOption.value;
      const option = foodOptions.find(opt => Number(opt.id) === Number(optionId));
      return option?.precio_extra ? parseFloat(option.precio_extra) : 0;
    }
    
    // Si es un ID directo
    const option = foodOptions.find(opt => Number(opt.id) === Number(foodOption));
    return option?.precio_extra ? parseFloat(option.precio_extra) : 0;
  }, [foodOptions]);

  // Memoize mampara price con compatibilidad para objetos complejos
  const getMamparaPrice = useCallback((mamparaObj) => {
    if (!mamparaObj) return 0;
    
    // Si es un objeto complejo, usar su precio directo o buscar por id.value
    if (typeof mamparaObj === 'object') {
      if (mamparaObj.precio) {
        return parseFloat(mamparaObj.precio);
      }
      const mamparaId = mamparaObj.value;
      const mampara = mamparas.find(m => Number(m.id) === Number(mamparaId));
      return mampara?.precio ? parseFloat(mampara.precio) : 0;
    }
    
    // Si es un ID directo
    const mampara = mamparas.find(m => Number(m.id) === Number(mamparaObj));
    return mampara?.precio ? parseFloat(mampara.precio) : 0;
  }, [mamparas]);

  // Memoize extras total
  const calculateExtrasTotal = useCallback((selectedExtras) => {
    if (!selectedExtras?.length) return 0;
    return selectedExtras.reduce((total, extra) => {
      const extraInfo = extras.find(e => e.id === extra.id);
      if (extraInfo?.precio && extra.cantidad) {
        return total + (parseFloat(extraInfo.precio) * parseInt(extra.cantidad));
      }
      return total;
    }, 0);
  }, [extras]);

  // Memoize total calculation
  const total = useMemo(() => {
    const packagePrice = calculatePackagePrice(formValues.id_paquete, formValues.fecha_reserva);
    const foodPrice = getFoodOptionPrice(formValues.id_opcion_alimento);
    const mamparaPrice = getMamparaPrice(formValues.id_mampara);
    const extrasTotal = calculateExtrasTotal(formValues.extras);
    
    return packagePrice + foodPrice + mamparaPrice + extrasTotal;
  }, [
    formValues,
    calculatePackagePrice,
    getFoodOptionPrice,
    getMamparaPrice,
    calculateExtrasTotal
  ]);

  // Update total when dependencies change
  useEffect(() => {
    setValue('total', total);
  }, [total, setValue]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <PackageSection 
        control={control}
        packages={packages}
        errors={errors}
        setValue={setValue}
      />

      <FoodOptionsSection
        control={control}
        errors={errors}
        foodOptions={foodOptions}
        setValue={setValue}
      />

      <DateTimeSection
        control={control}
        errors={errors}
        setValue={setValue}
        unavailableDates={unavailableDates}
        existingReservations={existingReservations}
        setIsTuesdayModalOpen={setIsTuesdayModalOpen}
        packages={packages}
      />

      <ThemeSection
        control={control}
        errors={errors}
        tematicas={tematicas}
        setValue={setValue}
      />

      <MamparaSection
        control={control}
        errors={errors}
        filteredMamparas={filteredMamparas}
        setValue={setValue}
      />

      <ExtrasSection
        control={control}
        extras={extras}
        setValue={setValue}
      />

      <CelebrantSection
        control={control}
        errors={errors}
      />

      <CommentsSection
        control={control}
      />

      <div className="flex justify-end mt-8">
        <button
          type="submit"
          className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm"
        >
          <FiCheck className="w-5 h-5" />
          {editingReservation ? 'Actualizar Reserva' : 'Crear Reserva'}
        </button>
      </div>
    </form>
  );
};

export default ReservationForm;