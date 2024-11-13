import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const CategoriaTable = ({ categorias, handleEditItem, handleDeleteItem }) => (
    <table className="w-full">
        <thead>
        <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Color</th>
            <th className="px-4 py-2 text-left">Acciones</th>
        </tr>
        </thead>
        <tbody>
        {categorias.map((categoria) => (
            <tr key={categoria.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2">{categoria.nombre}</td>
                <td className="px-4 py-2">
                    <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: categoria.color }}
                    ></div>
                </td>
                <td className="px-4 py-2">
                    <button
                        onClick={() => handleEditItem(categoria)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                        <FiEdit2 />
                    </button>
                    <button
                        onClick={() => handleDeleteItem(categoria.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <FiTrash2 />
                    </button>
                </td>
            </tr>
        ))}
        </tbody>
    </table>
);

export default CategoriaTable;