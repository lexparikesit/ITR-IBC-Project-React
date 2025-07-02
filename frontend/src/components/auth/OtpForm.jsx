"use client";

import { useEffect, useState } from "react";
import {
    Button,
    Stack,
    PinInput,
    Text
} from "@mantine/core";
import { redirect, useRouter } from "next/navigation";

export default function OtpForm() {
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(60); // Timer for OTP expiration
    const [canResend, setCanResend] = useState(false);
    const router = useRouter();

    // countdown timer
    useEffect(() => {
        const otpSent = localStorage.getItem("otp_sent") === "true";
        if (otpSent) {
            setCanResend(false);
            setTimer(60); // Reset timer to 60 seconds
            localStorage.removeItem("otp_sent"); // Clear the flag
        }
    }, []);

    const handleVerify = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Include cookies for session management
                body: JSON.stringify({ otp: otp }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                alert("OTP Verified Successfully!");
                router.push("/dashboard"); // Redirect to dashboard or home page
            } else {
                alert(data.message || "OTP Verification Failed!");
            }
        } catch (error) {
            console.error("OTP verification error:", error);
        }
    };

    const handleResend = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Include cookies for session management
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                alert("OTP Resent Successfully!");
                setOtp(""); // Clear the OTP input
                setTimer(60); // Reset the timer
                setCanResend(false); // Disable resend button until timer expires
            } else {
                alert(data.message || "Failed to resend OTP!");
            }
        } catch (error) {
            console.error("Resend OTP error:", error);
        }
    };

    return (
        <Stack>
            <div className="flex justify-center">
                <PinInput
                    length={6}
                    oneTimeCode
                    value={otp}
                    onChange={setOtp}
                    type="number"
                />
            </div>
            <div className="flex justify-center mt-10" mx="auto">
                <Button color="#A91D3A" onClick={handleVerify}>Verify OTP</Button>
            </div>
            <div className="flex justify-center mt-2">
                <Text size="sm" c="#7E99A3">
                    {canResend
                        ? "Didn’t receive OTP?"
                        : `Resend available in ${timer}s`}
                </Text>
            </div>
            <div className="flex justify-center mt-0.5">
                <Button
                    className="-mt-2"
                    color="#A91D3A"
                    onClick={handleResend}
                    disabled={!canResend}
                >
                    Resend OTP
                </Button>
            </div>
        </Stack>
    );
}