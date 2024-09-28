import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const generateRandomPassword = () => {
    const adjectives = [
        'Happy', 'Silly', 'Funny', 'Crazy', 'Lucky', 'Sunny', 'Brave', 'Kind', 'Cute',
        'Cool', 'Fast', 'Smart', 'Strong', 'Wise',
    ];
    const nouns = [
        'Cat', 'Dog', 'Bird', 'Fish', 'Panda', 'Koala', 'Lion', 'Tiger', 'Bear', 'Monkey',
        'Laundry', 'Pencil', 'Computer', 'Phone',
    ];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = numbers[Math.floor(Math.random() * numbers.length)];

    return `${adjective}${noun}${number}`;
};

const UserForm = ({ initialData, onSubmit })=> {
    const [generatedPassword, setGeneratedPassword] = useState('');
    const { register, handleSubmit } = useForm({ defaultValues: initialData });
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('nombre')} placeholder="Nombre" className="w-full mb-2 p-2 border rounded" />
            <input {...register('email')} placeholder="Email" className="w-full mb-2 p-2 border rounded" />
            <input {...register('telefono')} placeholder="Teléfono" className="w-full mb-2 p-2 border rounded" />
            <input {...register('direccion')} placeholder="Dirección" className="w-full mb-2 p-2 border rounded" />
            <input
                {...register('id_personalizado')}
                placeholder="ID Personalizado"
                className="w-full mb-2 p-2 border rounded"
            />
            <select {...register('tipo_usuario')} className="w-full mb-2 p-2 border rounded">
                <option value="">Seleccionar tipo de usuario</option>
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
            </select>
            <input
                {...register('clave')}
                type="password"
                placeholder="Contraseña"
                className="w-full mb-2 p-2 border rounded"
            />
            <button
                type="button"
                onClick={() => setGeneratedPassword(generateRandomPassword())}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
                Generar contraseña aleatoria
            </button>
            {generatedPassword && (
                <p className="mt-2">
                    Contraseña generada: <strong>{generatedPassword}</strong>
                </p>
            )}
            <div className="flex justify-end mt-4">
                <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                    {initialData ? 'Actualizar' : 'Crear'} Usuario
                </button>
            </div>
        </form>
    );
};
export default UserForm;