"use client";

import React, { 
    createContext, 
    useContext,
    useState,
    useEffect
} from "react"
import { useRouter } from "next/navigation"

// create context
const UserContext = createContext(null);

// hook custome
export const useUser = () => {
    return useContext(UserContext)
}

// provider userContext
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // function to load user from localStorage
        const loadUserFromStorage = () => {
            try {
                const storedUser = localStorage.getItem("user_data");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse user data from localStorage", error);
                localStorage.removeItem("user_data");
                localStorage.removeItem("access_token");
            } finally{
                setLoading(false);
            }
        };
        loadUserFromStorage();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        router.push("/login");
    };

    const value = {
        user,
        loading,
        login,
        logout,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}