"use client";

import { useState } from "react";
import { TextInput, PasswordInput, Button, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
	const router = useRouter();
	const [form, setForm] = useState({
		username: "",
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (field, value) => {
		setForm({ ...form, [field]: value });
	};

	const handleRegister = async () => {
		if (form.password !== form.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		try {
			setIsLoading(true);

			const response = await fetch("http://localhost:5000/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});

			const data = await response.json();

			if (response.ok) {
				alert("Registration Successful!");
				router.push("/login"); // Redirect to login page after successful registration
			} else {
				alert(data.message || "Registration Failed!");
			}
		} catch (error) {
			console.error("Registration Error!", error);
		} finally {
			setIsLoading(false);
		}
	};

	const inputStyles = {
		label: { color: "#A91D3A" },
		input: {
			borderColor: "#151515",
			color: "#333",
			backgroundColor: "#fff",
		},
		placeholder: { color: "#aaa" },
	};

	return (
		<Stack spacing="sm">
			<TextInput
				label="Username"
				placeholder="username"
				value={form.username}
				onChange={(e) => handleChange("username", e.currentTarget.value)}
				required
				styles={inputStyles}
			/>

			<TextInput
				label="First Name"
				placeholder="First Name"
				value={form.firstName}
				onChange={(e) => handleChange("firstName", e.currentTarget.value)}
				required
				styles={inputStyles}
			/>

			<TextInput
				label="Last Name"
				placeholder="Last Name"
				value={form.lastName}
				onChange={(e) => handleChange("lastName", e.currentTarget.value)}
				styles={inputStyles}
			/>

			<TextInput
				label="Email"
				placeholder="you@example.com"
				value={form.email}
				onChange={(e) => handleChange("email", e.currentTarget.value)}
				required
				styles={inputStyles}
			/>

			<PasswordInput
				label="Password"
				placeholder="••••••••"
				value={form.password}
				onChange={(e) => handleChange("password", e.currentTarget.value)}
				required
				styles={inputStyles}
			/>

			<PasswordInput
				label="Confirm Password"
				placeholder="••••••••"
				value={form.confirmPassword}
				onChange={(e) => handleChange("confirmPassword", e.currentTarget.value)}
				required
				styles={inputStyles}
			/>

			<Button fullWidth mt="md" onClick={handleRegister} color="#A91D3A">
				Register
			</Button>
		</Stack>
	);
}
