import React from 'react';

export const Table = ({ children }) => {
    return <table className="w-full text-left">{children}</table>;
};

export const TableHeader = ({ children }) => {
    return <thead className="bg-gray-100">{children}</thead>;
};

export const TableRow = ({ children }) => {
    return <tr className="border-b">{children}</tr>;
};

export const TableHead = ({ children }) => {
    return <th className="py-2 px-4 font-semibold">{children}</th>;
};

export const TableBody = ({ children }) => {
    return <tbody>{children}</tbody>;
};

export const TableCell = ({ children }) => {
    return <td className="py-2 px-4">{children}</td>;
};