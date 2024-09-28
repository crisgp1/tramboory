import React from 'react';
import UserTable from './tables/UserTable';
import ReservationTable from './tables/ReservationTable';
import FinanceTable from './tables/FinanceTable';
import PackageTable from './tables/PackageTable';

const TableView = ({ activeTab, data, selectedMonth, onEditItem, onViewReservation }) => {
    const { users, reservations, finances, packages } = data;

    const renderTable = () => {
        switch (activeTab) {
            case 'users':
                return <UserTable data={users} onEditItem={onEditItem} />;
            case 'reservations':
                return (
                    <ReservationTable
                        data={reservations}
                        onEditItem={onEditItem}
                        onViewReservation={onViewReservation}
                    />
                );
            case 'finances':
                return <FinanceTable data={finances} selectedMonth={selectedMonth} onEditItem={onEditItem} />;
            case 'packages':
                return <PackageTable data={packages} onEditItem={onEditItem} />;
            default:
                return null;
        }
    };

    return <div className="overflow-x-auto">{renderTable()}</div>;
};

export default TableView;