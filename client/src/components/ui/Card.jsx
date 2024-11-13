
export const Card = ({ children }) => {
    return <div className="bg-white shadow-md rounded-lg p-6">{children}</div>;
};

export const CardHeader = ({ children }) => {
    return <div className="mb-4">{children}</div>;
};

export const CardTitle = ({ children }) => {
    return <h3 className="text-xl font-semibold">{children}</h3>;
};

export const CardDescription = ({ children }) => {
    return <p className="text-gray-600">{children}</p>;
};

export const CardContent = ({ children }) => {
    return <div>{children}</div>;
};