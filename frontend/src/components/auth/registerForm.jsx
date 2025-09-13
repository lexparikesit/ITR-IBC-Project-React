"use client";

import { useState } from "react";
import { TextInput, PasswordInput, Button, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

export default function RegisterForm() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleRegister = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			notifications.show({
				title: "Validation Error",
				message: "Password Don't Match!",
				color: "red",
				autoClose: 5000,
			});
			return;
		}

		try {
			setIsLoading(true);

			const response = await apiClient.post("/register", {
				username,
				firstName,
				lastName,
				email,
				password,
				confirmPassword,
			});

			if (response.status == 201) {
				notifications.show({
					title: "Registration Successful",
                    message: response.data.message || "Your account has been created!",
                    color: "green",
                    autoClose: 5000,
				});
				router.push('/login');
			} else {
				notifications.show({
                    title: "Registration Failed",
                    message: response.data.message || "An unexpected error occurred.",
                    color: "red",
                    autoClose: 5000,
                });
			}
		} catch (error) {
			console.error("Registration Error!", error);
			let errorMessage = "An unexpected error occurred during registration. Please try again.";
			let errorTitle = "Registration Title";
			let errorColor = "red";

			if (error.response) {
				// error from backend (ex: status 409)
				if (error.response.status === 409) {
					errorMessage = error.response.data.message || "Username or Email already exists.";
                    errorTitle = "Duplicate Entry";
                    errorColor = "orange";
				} else {
					// other's of error from backend
                    errorMessage = error.response.data.message || errorMessage;
				}
			} else if (error.request) {
                errorMessage = "Network error. Please check your internet connection.";
			} else {
				errorMessage = error.message || errorMessage;
			}
			notifications.show({
                title: errorTitle,
                message: errorMessage,
                color: errorColor,
                autoClose: 5000,
            });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleRegister}>
			<Stack>
				<TextInput
					label="Username"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.currentTarget.value)}
					required
				/>
				<TextInput
					label="First Name"
					placeholder="First Name"
					value={firstName}
					onChange={(e) => setFirstName(e.currentTarget.value)}
					required
					mt={"sm"}
				/>
				<TextInput
					label="Last Name"
					placeholder="Last Name"
					value={lastName}
					onChange={(e) => setLastName(e.currentTarget.value)}
					mt={"sm"}
				/>
				<TextInput
					label="Email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
					required
					mt={"sm"}
				/>
				<PasswordInput
					label="Password"
					placeholder="••••••••"
					value={password}
					onChange={(e) => setPassword(e.currentTarget.value)}
					required
					mt={"sm"}
				/>
				<PasswordInput
					label="Confirm Password"
					placeholder="••••••••"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.currentTarget.value)}
					required
					mt={"sm"}
				/>
				<Button fullWidth mt="md" onClick={handleRegister} color="#A91D3A" loading={isLoading}>
					Register
				</Button>
			</Stack>
		</form>
	);
}
