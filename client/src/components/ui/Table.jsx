import React from 'react';

export const Table = ({ children }) => {
    return <table className="w-full text-left dark:text-white">{children}</table>;
};

export const TableHeader = ({ children }) => {
    return <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>;
};

export const TableRow = ({ children }) => {
    return <tr className="border-b dark:border-gray-700">{children}</tr>;
};

export const TableHead = ({ children }) => {
    return <th className="py-2 px-4 font-semibold dark:text-gray-200">{children}</th>;
};

export const TableBody = ({ children }) => {
    return <tbody>{children}</tbody>;
};

export const TableCell = ({ children }) => {
    return <td className="py-2 px-4 dark:text-gray-300">{children}</td>;
};