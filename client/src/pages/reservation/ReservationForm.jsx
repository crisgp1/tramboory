import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FiCheck } from 'react-icons/fi';
import { isTuesday } from 'date-fns';

// Import all section components
import PackageSection from './reservationform/PackageSection';
import FoodOptionsSection from './reservationform/FoodOptionsSection';
import DateTimeSection from './reservationform/DateTimeSection';
import ThemeSection from './reservationform/ThemeSection';
import MamparaSection from './reservationform/MamparaSection';
import ExtrasSection from './reservationform/ExtrasSection';
import CelebrantSection from './reservationform/CelebrantSection';
import CommentsSection from './reservationform/CommentsSection';

const TUESDAY_SURCHARGE = 500;

const ReservationForm = ({
  onSubmit,
  packages,
  foodOptions,
  tematicas,
  mamparas,
  extras,
  unavailableDates,
  existingReservations
}) => {
  const [isTuesdayModalOpen, setIsTuesdayModalOpen] = useState(false);
  const { control, setValue, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      packagePrice: 0,
      extrasTotal: 0,
      mamparaPrice: 0,
      tuesdayFee: 0,
      extras: [],
      total: 0
    }
  });

  // Memoize form values
  const formValues = useWatch({ control });
  
  // Memoize filtered mamparas
  const filteredMamparas = useMemo(() => 
    formValues.id_tematica
      ? mamparas.filter(m => m.id_tematica === formValues.id_tematica)
      : [],
    [formValues.id_tematica, mamparas]
  );

  // Memoize package price calculation
  const calculatePackagePrice = useCallback((packageId, date) => {
    if (!packageId || !date) return 0;
    
    const selectedPkg = packages.find(pkg => pkg.id === packageId);
    if (!selectedPkg) return 0;

    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek >= 5;
    const basePrice = isWeekend 
      ? parseFloat(selectedPkg.precio_viernes_domingo)
      : parseFloat(selectedPkg.precio_lunes_jueves);
    
    return basePrice + (isTuesday(new Date(date)) ? TUESDAY_SURCHARGE : 0);
  }, [packages]);

  // Memoize food option price
  const getFoodOptionPrice = useCallback((foodOptionId) => {
    if (!foodOptionId) return 0;
    const option = foodOptions.find(opt => opt.id === foodOptionId);
    return option?.precio_extra ? parseFloat(option.precio_extra) : 0;
  }, [foodOptions]);

  // Memoize mampara price
  const getMamparaPrice = useCallback((mamparaId) => {
    if (!mamparaId) return 0;
    const mampara = mamparas.find(m => m.id === mamparaId);
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

  const handleFormSubmit = useCallback((data) => {
    onSubmit({
      ...data,
      total,
      extras: data.extras?.map(extra => ({
        id: extra.id,
        cantidad: extra.cantidad
      })) || []
    });
  }, [total, onSubmit]);

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
          Crear Reserva
        </button>
      </div>
    </form>
  );
};

export default ReservationForm;