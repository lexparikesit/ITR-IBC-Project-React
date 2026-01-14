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
        try {
            const response = await apiClient.get("/user/me");
            const userData = response.data;

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
        localStorage.removeItem("user_data");
        apiClient.post("/logout").catch(() => {});
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
