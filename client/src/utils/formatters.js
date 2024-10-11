export const formatNumber = (number) => {
    return Number(number).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};
