"use client";

import { useState, useEffect, use } from "react";
import { PasswordInput, Button, Stack, Title, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const verificationToken = searchParams.get("access_token");

        if (verificationToken) {
            setToken(verificationToken);
        } else {
            router.push("/forgot-password");
            notifications.show({
                title: "Token Invalid",
                message: "Verification Token is Missing! Please try again.",
                color: "red",
                autoClose: 5000,
            });
        }
    }, [searchParams, router]);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            notifications.show({
                title: "Failed",
                message: "Passwords do not match! Please check again.",
                color: "red",
                autoClose: 5000,
            });
            return;
        }

        try {
            setIsLoading(true);
            const response = await apiClient.post("/forgot-password/reset", {
                token,
                new_password: newPassword
            });

            if (response.status === 200) {
                notifications.show({
                    title: "Success",
                    message: "Your password has been successfully changed! Please log in.",
                    color: "green",
                    autoClose: 5000,
                });
                router.push("/login");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            let errorMessage = "Token is invalid or has expired.";
            
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            }
            notifications.show({
                title: "Failed to Reset Password",
                message: errorMessage,
                color: "red",
                autoClose: 5000,
            });

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleResetPassword}>
            <Stack>
                <PasswordInput
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.currentTarget.value)}
                    required
                    leftSection={<IconLock size={16} />}
                />
                <PasswordInput
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.currentTarget.value)}
                    required
                    mt="sm"
                    leftSection={<IconLock size={16} />}
                />
                <Button 
                    fullWidth 
                    mt="md" 
                    type="submit" 
                    color="#A91D3A" 
                    loading={isLoading}
                >
                    Reset Password
                </Button>
            </Stack>
        </form>
    )
}