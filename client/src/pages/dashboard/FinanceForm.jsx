import { useState, useEffect } from 'react';
import { FiDollarSign, FiCalendar, FiFileText, FiTag, FiPackage, FiUpload, FiFile, FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { TwitterPicker } from 'react-color';

const FinanceForm = ({ editingItem, onSubmit, categories, onAddCategory, onClose }) => {
    const [formData, setFormData] = useState(editingItem || {});
    const [newCategory, setNewCategory] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(editingItem?.categoria?.id || '');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [categoryColor, setCategoryColor] = useState('#FF6900');
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        if (editingItem?.categoria) {
            setSelectedCategoryId(editingItem.categoria.id);
        }
    }, [editingItem]);

    const handleAddCategory = () => {
        if (newCategory && !categories.find(cat => cat.name === newCategory)) {
            onAddCategory({ nombre: newCategory, color: categoryColor });
            setNewCategory('');
            setShowNewCategoryInput(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            categoria: categories.find(cat => cat.id === selectedCategoryId),
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData(prevData => ({
            ...prevData,
            [name]: newValue,
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            name="tipo"
                            defaultValue={editingItem?.tipo || ''}
                            className="pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Seleccionar tipo</option>
                            <option value="ingreso">Ingreso</option>
                            <option value="gasto">Gasto</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                    <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            name="monto"
                            type="number"
                            step="0.01"
                            placeholder="Monto"
                            defaultValue={editingItem?.monto || ''}
                            className="pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            name="fecha"
                            type="date"
                            defaultValue={editingItem?.fecha || ''}
                            className="pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <div className="relative flex items-center">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                    <select
                        name="categoria"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Seleccionar categoría</option>
                        {categories?.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                        className="ml-2 p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {showNewCategoryInput ? <FiMinus/> : <FiPlus/>}
                    </button>
                </div>
            </div>

            {showNewCategoryInput && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Nueva categoría"
                            className="flex-grow p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <div
                            className="w-8 h-8 rounded-full cursor-pointer"
                            style={{ backgroundColor: categoryColor }}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                        />
                    </div>
                    {showColorPicker && (
                        <div className="relative">
                            <TwitterPicker
                                color={categoryColor}
                                onChangeComplete={(color) => setCategoryColor(color.hex)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowColorPicker(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            >
                                <FiX />
                            </button>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleAddCategory}
                        className="mt-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Añadir Categoría
                    </button>
                </div>
            )}

            <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                        name="descripcion"
                        placeholder="Descripción"
                        defaultValue={editingItem?.descripcion || ''}
                        className="pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3"
                    ></textarea>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reserva Asociada</label>
                <div className="relative">
                    <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        name="id_reserva"
                        defaultValue={editingItem?.id_reserva || ''}
                        className="pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Sin reserva asociada</option>
                        {/* Aquí deberías mapear las reservas disponibles */}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factura PDF</label>
                <div className="relative">
                    <FiUpload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="factura_pdf"
                        type="file"
                        accept=".pdf"
                        className="pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factura XML</label>
                <div className="relative">
                    <FiFile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="factura_xml"
                        type="file"
                        accept=".xml"
                        className="pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {editingItem && editingItem.archivo_prueba && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Archivo de prueba actual</label>
                    <div className="text-sm text-gray-500">{editingItem.archivo_prueba}</div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo de Prueba (Opcional)</label>
                <div className="relative">
                    <FiUpload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="archivo_prueba"
                        type="file"
                        className="pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
        </form>
    );
};


export default FinanceForm;