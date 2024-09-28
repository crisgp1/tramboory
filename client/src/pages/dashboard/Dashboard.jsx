import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

import StatCards from './StatCards';
import TabNavigation from './TabNavigation';
import TableView from './TableView';
import FormModal from './FormModal';
import ReservationModal from './ReservationModal';
import MonthSelector from './MonthSelector';
import ScreenSizeAlert from './ScreenSizeAlert';

import { fetchData, filterDataByMonth } from '../services/dashboardService';

const Dashboard = () => {
    const [data, setData] = useState({
        users: [],
        reservations: [],
        finances: [],
        packages: [],
    });
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [activeTab, setActiveTab] = useState('users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            fetchData(token, setData, setLoading, toast, navigate);
        } else {
            console.error('No se encontró token de autenticación');
            navigate('/signin');
        }
    }, [navigate]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleAddItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleViewReservation = (reservation) => {
        setSelectedReservation(reservation);
        setIsReservationModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
            {isSmallScreen && <ScreenSizeAlert />}
            <ToastContainer />
            <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800">
                Panel de Control
            </h1>
            <StatCards data={data} selectedMonth={selectedMonth} />
            <div className="bg-white rounded-lg shadow-lg p-6">
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} onAddItem={handleAddItem} />
                <TableView
                    activeTab={activeTab}
                    data={data}
                    selectedMonth={selectedMonth}
                    onEditItem={handleEditItem}
                    onViewReservation={handleViewReservation}
                />
            </div>
            <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
            <FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                activeTab={activeTab}
                editingItem={editingItem}
                onSubmit={() => {
                    setIsModalOpen(false);
                    fetchData(Cookies.get('token'), setData, setLoading, toast, navigate);
                }}
            />
            <ReservationModal
                reservation={selectedReservation}
                isOpen={isReservationModalOpen}
                onClose={() => setIsReservationModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;