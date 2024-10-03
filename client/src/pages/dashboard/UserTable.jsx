import React from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const UserTable = ({ users, userSearch, setUserSearch, handleEditItem, handleDeleteItem, handleViewUser }) => {
    return (
        <>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left">ID Personalizado</th>
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Tipo de Usuario</th>
                        <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-2">{user.id_personalizado || 'N/A'}</td>
                            <td className="px-4 py-2">{user.nombre}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">
                  <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.tipo_usuario === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                      }`}
                  >
                    {user.tipo_usuario}
                  </span>
                            </td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={() => handleViewUser(user)}
                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                    title="Ver detalles"
                                >
                                    <FiEye />
                                </button>
                                <button
                                    onClick={() => handleEditItem(user)}
                                    className="text-green-500 hover:text-green-700 mr-2"
                                    title="Editar"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(user.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Eliminar"
                                >
                                    <FiTrash2 />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default UserTable;