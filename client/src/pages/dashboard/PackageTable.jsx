import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const PackageTable = ({ data, onEditItem }) => {
    return (
        <table className="w-full">
            <thead>
            <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Precio</th>
                <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {data.map((pkg) => (
                <tr key={pkg.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">{pkg.nombre}</td>
                    <td className="px-4 py-2">{pkg.descripcion}</td>
                    <td className="px-4 py-2">${pkg.precio}</td>
                    <td className="px-4 py-2">
                        <button onClick={() => onEditItem(pkg)} className="text-blue-500 hover:text-blue-700 mr-2">
                            <FiEdit2 />
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                            <FiTrash2 />
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default PackageTable;