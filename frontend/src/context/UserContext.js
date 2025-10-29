"use client";

import React, { 
    createContext, 
    useContext,
    useState,
    useEffect
} from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/libs/api";

// create context
const UserContext = createContext(null);

// hook custome
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within UserProvider");
    }
    return context;
};

// provider userContext
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.get("/user/me");
            const userData = response.data;

            // save to localStorage
            localStorage.setItem("user_data", JSON.stringify(userData));
            setUser(userData);

        } catch (error) {
            console.log("Failed to fetch user from API", error);
            const storedUser = localStorage.getItem("user_data");

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    localStorage.removeItem("user_data");
                }
            }

            localStorage.removeItem("access_token");
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user_data", JSON.stringify(userData));
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
        fetchUser,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}