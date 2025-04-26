import { create } from 'zustand'

const useUiStore = create((set) => ({
  // Tab navigation
  activeTab: 'users',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Modal states
  isModalOpen: false,
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  
  isReservationModalOpen: false,
  setIsReservationModalOpen: (isOpen) => set({ isReservationModalOpen: isOpen }),
  
  isReportModalOpen: false,
  setIsReportModalOpen: (isOpen) => set({ isReportModalOpen: isOpen }),
  
  isPaymentModalOpen: false,
  setIsPaymentModalOpen: (isOpen) => set({ isPaymentModalOpen: isOpen }),
  
  isUserModalOpen: false,
  setIsUserModalOpen: (isOpen) => set({ isUserModalOpen: isOpen }),
  
  // Payment modal mode
  paymentModalMode: 'view',
  setPaymentModalMode: (mode) => set({ paymentModalMode: mode }),
  
  // Search states
  userSearch: '',
  setUserSearch: (search) => set({ userSearch: search }),
  
  reservationSearch: '',
  setReservationSearch: (search) => set({ reservationSearch: search }),
  
  archivedSearch: '',
  setArchivedSearch: (search) => set({ archivedSearch: search }),
  
  // Date selection
  selectedMonth: new Date().getMonth(),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  
  selectedYear: new Date().getFullYear(),
  setSelectedYear: (year) => set({ selectedYear: year }),
  
  // Loading state
  loading: false,
  setLoading: (isLoading) => set({ loading: isLoading }),
  
  // Screen size alert
  isSmallScreen: false,
  setIsSmallScreen: (isSmall) => set({ isSmallScreen: isSmall }),
  
  showAlert: true,
  setShowAlert: (show) => set({ showAlert: show }),
  
  // Form helpers
  generatedPassword: '',
  setGeneratedPassword: (password) => set({ generatedPassword: password }),
  generateRandomPassword: () => {
    const adjectives = [
      'Happy', 'Silly', 'Funny', 'Crazy', 'Lucky', 
      'Sunny', 'Brave', 'Kind', 'Cute', 'Cool', 
      'Fast', 'Smart', 'Strong', 'Wise'
    ];
    const nouns = [
      'Cat', 'Dog', 'Bird', 'Fish', 'Panda', 
      'Koala', 'Lion', 'Tiger', 'Bear', 'Monkey', 
      'Laundry', 'Pencil', 'Computer', 'Phone'
    ];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = numbers[Math.floor(Math.random() * numbers.length)];

    const password = `${adjective}${noun}${number}`;
    set({ generatedPassword: password });
  }
}))

export default useUiStore