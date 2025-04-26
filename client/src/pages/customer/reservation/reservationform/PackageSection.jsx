import React, { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { FiPackage, FiAlertCircle, FiInfo } from 'react-icons/fi';
import Select from 'react-select';
import FormSection from './FormSection';
import { customSelectStyles, formatCurrency } from './styles';

const PackageOption = React.memo(({ pkg }) => (
  <div className="p-2 space-y-2">
    <div className="font-medium text-gray-900">{pkg.nombre}</div>
    <div className="text-sm text-gray-600">
      <div>L-J: {formatCurrency(pkg.precio_lunes_jueves)}</div>
      <div>V-D: {formatCurrency(pkg.precio_viernes_domingo)}</div>
    </div>
  </div>
));

PackageOption.displayName = 'PackageOption';

const PackageInfo = React.memo(({ selectedPackage }) => {
  if (!selectedPackage) return null;
  
  return (
    <div className="mt-2 text-sm text-indigo-600 bg-indigo-50 p-2 rounded-md flex items-center gap-2">
      <FiInfo className="w-4 h-4" />
      <span>
        Precios: L-J {formatCurrency(selectedPackage.precio_lunes_jueves)} | 
        V-D {formatCurrency(selectedPackage.precio_viernes_domingo)}
      </span>
    </div>
  );
});

PackageInfo.displayName = 'PackageInfo';

const PackageSelect = React.memo(({ field, options, packages, customStyles }) => {
  const selectedOption = useMemo(() => 
    options.find((option) => option.value === field.value),
    [options, field.value]
  );

  const selectedPackage = useMemo(() => 
    packages.find(p => p.id === field.value),
    [packages, field.value]
  );

  return (
    <div>
      <Select
        {...field}
        options={options}
        value={selectedOption}
        onChange={(option) => field.onChange(option ? option.value : null)}
        placeholder="Seleccionar paquete"
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          ...customStyles,
          option: (base) => ({
            ...base,
            padding: '8px 12px',
            cursor: 'pointer'
          })
        }}
        components={{
          Option: ({ data, ...props }) => (
            <div {...props.innerProps}>
              <PackageOption pkg={packages.find(p => p.id === data.value)} />
            </div>
          )
        }}
        isClearable
      />
      <PackageInfo selectedPackage={selectedPackage} />
    </div>
  );
});

PackageSelect.displayName = 'PackageSelect';

const PackageSection = ({ control, packages, errors }) => {
  const packageOptions = useMemo(() => 
    packages.map((pkg) => ({
      value: pkg.id,
      label: pkg.nombre
    })),
    [packages]
  );

  return (
    <FormSection title="Información del Paquete" icon={FiPackage}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecciona tu Paquete
          </label>
          <div className="relative">
            <Controller
              name="id_paquete"
              control={control}
              rules={{ required: 'Paquete es requerido' }}
              render={({ field }) => (
                <PackageSelect
                  field={field}
                  options={packageOptions}
                  packages={packages}
                  customStyles={customSelectStyles}
                />
              )}
            />
            {errors.id_paquete && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.id_paquete.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default React.memo(PackageSection);