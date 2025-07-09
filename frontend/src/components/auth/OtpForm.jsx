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
    const [userID, setUserID] = useState(null);
    const router = useRouter();

    // countdown timer
    useEffect(() => {
        const storedUserID = localStorage.getItem("user_id");
        
        console.log("OtpForm - User ID from localStorage:", storedUserID); //--> debuging

        if (storedUserID) {
            setUserID(storedUserID);
        } else {
            console.log("OtpForm - No User ID found in localStorage. Redirecting to login."); // --> debugging
            alert("User ID not found. Please log in again."); 
            router.push("/login"); 
            return;
        }
        
        const otpSent = localStorage.getItem("otp_sent") === "true";
        if (otpSent) {
            setCanResend(false);
            setTimer(60); // Reset timer to 60 seconds
            localStorage.removeItem("otp_sent"); // Clear the flag
        }

        let countdownInterval;
        
        if (!canResend) {
            countdownInterval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
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

    const handleVerify = async () => {

        if (!userID) {
            alert("User ID not found. Please log in again.");
            router.push("/login");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Include cookies for session management
                body: JSON.stringify({ 
                    user_id: userID,
                    otp: otp 
                }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                alert("OTP Verified Successfully!");
                localStorage.removeItem("user_id");
                router.push("/dashboard"); // Redirect to dashboard or home page
            } else {
                alert(data.message || "OTP Verification Failed!");
            }
        } catch (error) {
            console.error("OTP verification error:", error);
            alert("An error occurred during verification.");
        }
    };

    const handleResend = async () => {

        if (!userID) {
            alert("User ID not found. Cannot resend OTP. Please log in again.");
            router.push("/login");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Include cookies for session management
                body: JSON.stringify({ user_id: userID }),
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