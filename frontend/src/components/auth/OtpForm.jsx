"use client";

import { useEffect, useState } from "react";
import { Button, Stack, PinInput, Text } from "@mantine/core";
import { redirect, useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { useUser } from "@/context/UserContext"; 
import apiClient, { prefetchCsrfToken, setAccessToken } from "@/libs/api";

export default function OtpForm() {
	const [otp, setOtp] = useState("");
	const [timer, setTimer] = useState(300); // Timer for OTP expiration
	const [canResend, setCanResend] = useState(false);
	const [userEmail, setUserEmail] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { login } = useUser();

	// countdown timer
	useEffect(() => {
		const storedUserEmail = localStorage.getItem("user_email_for_otp");
	
		console.log("OtpForm - User Email from localStorage:", storedUserEmail); // DEBUGGING

		if (storedUserEmail && storedUserEmail !== "null" && storedUserEmail !== "undefined") {
			setUserEmail(storedUserEmail);
			console.log("OtpForm - Has Setting:", storedUserEmail); // --> debugging
		} else {
			console.log("OtpForm - No User ID or Email found in localStorage. Redirecting to login."); // --> debugging
			notifications.show({
				title: "Email Not Found!",
				message: "Please log in again to receive a new OTP.",
				color: "red",
				autoClose: 5000,
			});
			router.push("/login");
			return;
		}

		const otpSent = localStorage.getItem("otp_sent") === "true";
		
        if (otpSent) {
			setCanResend(false);
			setTimer(300); // Reset timer to 300 seconds
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
		if (!userEmail) {
            notifications.show({
                title: "Error",
                message: "Email not found. Please log in again.",
                color: "red",
                autoClose: 5000,
            });
            router.push("/login");
            return;
        }

		setIsLoading(true);

		try {
			await prefetchCsrfToken();
			const response = await apiClient.post("/login-otp", {
				email: userEmail,
				otp_code: otp,
			});

			const data = response.data;
			console.log("API Respond for Verification", data);

			if (data.user_id && data.email && data.user) {
				if (data.access_token) {
					setAccessToken(data.access_token);
				}
				try {
					const userRes = await apiClient.get("/user/me");
					const userData = userRes.data;

					localStorage.setItem("user_data", JSON.stringify(userData));
					login(userData);
					localStorage.removeItem("user_email_for_otp");

					notifications.show({
						title: "OTP Verified Successfully",
						message: "You can now access your account.",
						color: "green",
						autoClose: 5000,
					});
					router.push("/dashboard");

				} catch (userError) {
					console.error("Failed to fetch user data after OTP:", userError);
					notifications.show({
						title: "Login Partially Failed",
						message: "User authenticated but profile data unavailable. Please contact support.",
						color: "orange"
					});
					router.push("/dashboard");
				}

			} else {
				console.error("OTP verification was successful but the required data was incomplete in the response:", data);
				notifications.show({
                    title: "Verficiation Failed",
                    message: "The required data is incomplete from the server. Please try again or contact support.",
                    color: "red",
                    autoClose: 5000,
                });
			}
			
		} catch (error) {
			console.error("Network error during OTP verification:", error);
            const errorMessage = error.response?.data?.message || "Network Error! Please Retry";
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
                message: "Email not found. Cannot resend OTP. Please log in again.",
                color: "red",
                autoClose: 5000,
            });
            router.push("/login");
            return;
        }

		try {
			await prefetchCsrfToken();
			const response = await apiClient.post("/resend-otp", {
				email: userEmail,
			});
			notifications.show({
                title: "OTP Resent",
                message: "A new OTP has been sent to your email.",
                color: "blue",
                autoClose: 5000,
            });
			setOtp(""); // Clear the OTP input
            setTimer(300); // Reset the timer to 5 minutes
            setCanResend(false); // Disable resend button until timer expires
		
		} catch (error) {
			console.error("Resend OTP error:", error);
			const errorMessage = error.response?.data?.message || "Failed to resend OTP.";
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
	);
}
