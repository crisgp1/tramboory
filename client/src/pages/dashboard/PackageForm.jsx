import { FiPackage, FiFileText, FiDollarSign, FiClock, FiUsers, FiList, FiImage } from 'react-icons/fi';
import WithValidation from '../../components/withValidation.jsx'
import CurrencyInput from '../../components/CurrencyInput.jsx';

const PackageForm = ({ editingItem, onSubmit }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Validación
        const requiredFields = ['nombre', 'descripcion', 'precio_base', 'duracion', 'capacidad_maxima', 'tipo_evento'];
        const emptyFields = requiredFields.filter(field => !data[field]);

        if (emptyFields.length > 0) {
            alert(`Por favor, complete los siguientes campos: ${emptyFields.join(', ')}`);
            return;
        }

        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WithValidation
                label="Nombre del Paquete"
                name="nombre"
                required
                icon={FiPackage}
                defaultValue={editingItem?.nombre || ''}
                className="col-span-1 md:col-span-2"
            />

            <WithValidation
                label="Descripción"
                name="descripcion"
                component="textarea"
                required
                icon={FiFileText}
                defaultValue={editingItem?.descripcion || ''}
                className="col-span-1 md:col-span-2"
            />

            <WithValidation
                label="Precio Base"
                name="precio_base"
                required
                component={CurrencyInput}
                icon={FiDollarSign}
                defaultValue={editingItem?.precio_base || ''}
            />

            <WithValidation
                label="Duración (horas)"
                name="duracion"
                type="number"
                required
                icon={FiClock}
                defaultValue={editingItem?.duracion || ''}
                step="0.5"
            />

            <WithValidation
                label="Capacidad Máxima"
                name="capacidad_maxima"
                type="number"
                required
                icon={FiUsers}
                defaultValue={editingItem?.capacidad_maxima || ''}
            />

            <WithValidation
                label="Tipo de Evento"
                name="tipo_evento"
                component="select"
                required
                icon={FiList}
                defaultValue={editingItem?.tipo_evento || ''}
            >
                <option value="">Seleccionar tipo de evento</option>
                <option value="cumpleaños">Cumpleaños</option>
                <option value="aniversario">Aniversario</option>
                <option value="corporativo">Evento Corporativo</option>
                <option value="otro">Otro</option>
            </WithValidation>

            <WithValidation
                label="Servicios Incluidos"
                name="servicios_incluidos"
                component="textarea"
                icon={FiList}
                defaultValue={editingItem?.servicios_incluidos || ''}
                className="col-span-1 md:col-span-2"
            />

            <WithValidation
                label="URL de la Imagen"
                name="imagen_url"
                icon={FiImage}
                defaultValue={editingItem?.imagen_url || ''}
                className="col-span-1 md:col-span-2"
            />

            <WithValidation
                label="Términos y Condiciones"
                name="terminos_condiciones"
                component="textarea"
                icon={FiFileText}
                defaultValue={editingItem?.terminos_condiciones || ''}
                className="col-span-1 md:col-span-2"
            />

            <div className="col-span-1 md:col-span-2 mt-4">
                <button
                    type="submit"
                    className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
                >
                    {editingItem ? 'Actualizar' : 'Crear'} Paquete
                </button>
            </div>
        </form>
    );
};

export default PackageForm;