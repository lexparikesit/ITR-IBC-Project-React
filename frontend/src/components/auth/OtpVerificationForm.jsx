"use client";

import { useEffect, useState } from "react";
import { Button, Stack, PinInput, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

export default function OtpVerificationForm() {
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(300); // Timer for OTP expiration
    const [canResend, setCanResend] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // countdown timer
    useEffect(() => {
        const storedUserEmail = localStorage.getItem("user_email_for_otp");
        
        if (storedUserEmail && storedUserEmail !== "null" && storedUserEmail !== "undefined") {
            setUserEmail(storedUserEmail);
        } else {
            notifications.show({
                title: "Email Not Found!",
                message: "Please try the password recovery process again.",
                color: "red",
                autoClose: 5000,
            });
            router.push("/login");
            return;
        }

        const otpSent = localStorage.getItem("otp_sent") === "true";
        if (otpSent) {
            setCanResend(false);
            setTimer(300);
            localStorage.removeItem("otp_sent");
        }

        let countdownInterval;
        
        if (!canResend) {
            countdownInterval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 0) {
                        clearInterval(countdownInterval);
                        setCanResend(true);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }
        return () => clearInterval(countdownInterval);
    }, [canResend, router]);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!userEmail || !otp) {
            notifications.show({
                title: "Error",
                message: "Email not found. Please Register Your Account.",
                color: "red",
                autoClose: 5000,
            });
            router.push("/login");
            return;
        }
        setIsLoading(true);

        try {
            const response = await apiClient.post("/forgot-password/verify-otp", {
                email: userEmail,
                otp_code: otp,
            });

            if (response.status === 200) {
                const resetToken = response.data.token;
                notifications.show({
                    title: "OTP Verified!",
                    message: "You can now reset your password.",
                    color: "green",
                    autoClose: 2000,
                });
                router.push(`/reset-password?access_token=${resetToken}`);
            }
        } catch (error) {
            console.error("Network error during OTP verification:", error);
            const errorMessage = error.response?.data?.message || "Network Error! Please try again.";
            notifications.show({
                title: "Error",
                message: errorMessage,
                color: "red",
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!userEmail) {
            notifications.show({
                title: "Error",
                message: "Email not found. Please try the process again.",
                color: "red",
                autoClose: 5000,
            });
            router.push("/forgot-password");
            return;
        }

        try {
            const response = await apiClient.post("/forgot-password/request-otp", {
                email: userEmail,
        });
        notifications.show({
            title: "OTP Resent",
            message: "A new OTP has been sent to your email.",
            color: "blue",
            autoClose: 5000,
        });
        setOtp("");
        setTimer(300);
        setCanResend(false);

    } catch (error) {
        console.error("Resend OTP error:", error);
        const errorMessage = error.response?.data?.message || "Gagal mengirim ulang OTP.";
            notifications.show({
                title: "Error",
                message: errorMessage,
                color: "red",
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <PinInput
                length={6}
                oneTimeCode
                value={otp}
                onChange={setOtp}
                type="number"
                my={12}
            />
            <Button color="#A91D3A" onClick={handleVerify} loading={isLoading}>
				Verify OTP
			</Button>
            <p className="text-sm mt-2" style={{ color: "#7E99A3" }}>
                {canResend ? "Didn’t receive OTP?" : `Resend available in ${formatTime(timer)}s`}{" "}
                {canResend && (
                    <span
                        onClick={handleResend}
                        className="cursor-pointer underline font-semibold hover:text-rose-700 text-rose-800"
                    >
                        Resend OTP
                    </span>
                )}
            </p>
        </div>
    )
};