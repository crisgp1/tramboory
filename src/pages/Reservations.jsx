// src/components/ReservationForm.jsx
import { useState } from 'react';
import { format, eachHourOfInterval, addHours } from 'date-fns';

export default function ReservationForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        date: '',
        time: '',
        package: '1',
        additionalItems: []
    });

    const hours = eachHourOfInterval({
        start: new Date(),  // Starting now
        end: addHours(new Date(), 12)  // Next 12 hours
    });

    const additionalOptions = [
        { id: 'balloons', label: 'Balloons' },
        { id: 'cake', label: 'Cake' },
        { id: 'dj', label: 'DJ' },
        { id: 'photographer', label: 'Photographer' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "additionalItems") {
            let items = [...formData.additionalItems];
            if (items.includes(value)) {
                items = items.filter(item => item !== value);
            } else {
                items.push(value);
            }
            setFormData(prev => ({ ...prev, additionalItems: items }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        // Implement submission logic here
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date of Event</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                </div>
            </div>
            <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                <select name="time" value={formData.time} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    {hours.map(hour => (
                        <option key={hour} value={format(hour, 'HH:mm')}>
                            {format(hour, 'HH:mm')}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="package" className="block text-sm font-medium text-gray-700">Package</label>
                <select name="package" value={formData.package} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>Pack {n}</option>
                    ))}
                </select>
            </div>
            <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-gray-700">Additional Items</legend>
                {additionalOptions.map(option => (
                    <div key={option.id}>
                        <label htmlFor={option.id} className="flex items-center">
                            <input type="checkbox" name="additionalItems" value={option.id} checked={formData.additionalItems.includes(option.id)} onChange={handleInputChange} className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"/>
                            <span className="ml-2 text-gray-700">{option.label}</span>
                        </label>
                    </div>
                ))}
            </fieldset>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Submit</button>
        </form>
    );
}
