import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

const ScreenSizeAlert = () => (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 text-yellow-800 px-4 py-3 shadow-md z-50">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <FiAlertCircle className="mr-2" />
                <p>
                    Para una mejor experiencia, se recomienda usar un iPad o dispositivo con pantalla más grande.
                </p>
            </div>
            <button className="text-yellow-800 hover:text-yellow-900">
                <FiX size={24} />
            </button>
        </div>
    </div>
);

export default ScreenSizeAlert;