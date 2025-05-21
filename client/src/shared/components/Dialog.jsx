import React from 'react';
import { createPortal } from 'react-dom';

export const Dialog = ({ open, onClose, children }) => {
    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg z-10">{children}</div>
        </div>,
        document.body
    );
};

export const DialogTitle = ({ children }) => {
    return <h2 className="text-2xl font-semibold mb-4 px-6 pt-6">{children}</h2>;
};

export const DialogContent = ({ children }) => {
    return <div className="p-6">{children}</div>;
};

export const DialogActions = ({ children }) => {
    return <div className="p-6 flex justify-end">{children}</div>;
};