"use client";

import { useState } from "react";
import { TextInput, Button, Stack, Title, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

export default function ForgetPasswordForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const response = await apiClient.post("/forgot-password/request-otp", { email });

            if (response.status === 200) {
                localStorage.setItem("user_email_for_otp", email);
                notifications.show({
                    title: "OTP is sent!",
                    message: "Check your email for the OTP.",
                    autoClose: 5000,
                    position: "top-center",
                    color: "orange",
                });
                localStorage.setItem("otp_sent", "true");
                router.push("/otp-verify");
            }
        } catch (error) {
            console.error("Error requesting OTP:", error);
            let errorMessage = "Network error. Please try again.";
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            }
            notifications.show({
                title: "Error Requesting OTP",
                message: errorMessage,
                color: "red",
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleRequestOtp}>
            <Stack>
                <TextInput
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    required
                />
            </Stack>
            <Button fullWidth mt="md" type="submit" color="#A91D3A" loading={isLoading}>
                Send OTP Code
            </Button>
        </form>
    )
}