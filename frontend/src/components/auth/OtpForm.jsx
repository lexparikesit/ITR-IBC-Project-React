"use client";

import { useEffect, useState } from "react";
import { Button, Stack, PinInput, Text } from "@mantine/core";
import { redirect, useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

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
			console.log(
				"OtpForm - No User ID found in localStorage. Redirecting to login."
			); // --> debugging
			notifications.show({
				title: "User ID not found",
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
			const data = await apiClient.post("/verify-otp", {
				user_id: userID,
				otp: otp,
			});

			notifications.show({
				title: "OTP Verified Successfully",
				message: "You can now access your account.",
				color: "green",
				autoClose: 5000,
			});
			localStorage.removeItem("user_id");
			router.push("/dashboard"); // Redirect to dashboard or home page
		} catch (error) {
			console.error("OTP verification error:", error);
			notifications.show({
				title: "Error",
				message: "An error occurred during verification.",
				color: "red",
				autoClose: 5000,
			});
		}
	};

	const handleResend = async () => {
		if (!userID) {
			alert("User ID not found. Cannot resend OTP. Please log in again.");
			router.push("/login");
			return;
		}

		try {
			const response = await fetch("/resend-otp", {
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
		<div className="flex flex-col items-center gap-2">
			<PinInput
				length={6}
				oneTimeCode
				value={otp}
				onChange={setOtp}
				type="number"
				my={12}
			/>
			<Button color="#A91D3A" onClick={handleVerify}>
				Verify OTP
			</Button>
			<p className="text-sm mt-2" style={{ color: "#7E99A3" }}>
				{canResend ? "Didn’t receive OTP?" : `Resend available in ${timer}s`}{" "}
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
