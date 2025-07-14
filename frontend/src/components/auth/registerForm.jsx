"use client";

import { useState } from "react";
import { TextInput, PasswordInput, Button, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
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

	const handleRegister = async () => {
		if (password !== confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		try {
			setIsLoading(true);

			const data = await apiClient.post("/register", {
				username,
				firstName,
				lastName,
				email,
				password,
				confirmPassword,
			});

			alert("Registration Successful!");
			router.push("/login"); // Redirect to login page after successful registration
		} catch (error) {
			console.error("Registration Error!", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
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

			<Button fullWidth mt="md" onClick={handleRegister} color="#A91D3A">
				Register
			</Button>
		</div>
	);
}
