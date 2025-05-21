// src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const verifyToken = () => {
            const token = Cookies.get('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    console.log("Decoded token:", decoded);  // Para depuración

                    // Verifica si el token ha expirado
                    if (decoded.exp && decoded.exp > Date.now() / 1000) {
                        setIsAuthenticated(true);
                        setUser(decoded);  // Guarda la información del usuario
                    } else {
                        console.log("Token expirado");
                        Cookies.remove('token');
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error decoding token:', error);
                    Cookies.remove('token');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            setIsLoading(false);
        };

        verifyToken();
    }, []);

    const login = (token) => {
        Cookies.set('token', token, { expires: 1 });  // Expira en 1 día
        setIsAuthenticated(true);
        setUser(jwtDecode(token));
    };

    const logout = () => {
        Cookies.remove('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return { isAuthenticated, isLoading, user, login, logout };
};