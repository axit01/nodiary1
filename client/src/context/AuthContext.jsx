import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* 
   * UI-ONLY MODE: Backend API calls are replaced with local mock state.
   */

    // Mock API object to avoid breaking components that use it
    const api = {
        get: async () => ({ data: {} }),
        post: async () => ({ data: {} }),
        put: async () => ({ data: {} }),
        delete: async () => ({ data: {} }),
    };

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // logical mock login
        if (email && password) {
            const mockUser = {
                _id: '12345',
                name: 'Demo Admin',
                email: email,
                role: 'admin',
                token: 'mock-jwt-token-123'
            };
            setUser(mockUser);
            localStorage.setItem('userInfo', JSON.stringify(mockUser));
            return mockUser;
        } else {
            throw "Invalid email or password";
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, api }}>
            {children}
        </AuthContext.Provider>
    );
};
