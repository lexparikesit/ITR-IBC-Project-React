"use client";

import { 
	TextInput,
	Button, 
	Stack,
	Select,
	Text, 
} from "@mantine/core";
import { useState, useEffect } from "react";
import { IconAt, IconLock, IconUser, IconMail, IconShield } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

export default function RegisterForm({ onSuccess }) {
	const [username, setUsername] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [selectedRole, setSelectedRole] = useState("");
	const [availableRoles, setAvailableRoles] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchRoles = async () => {
			try {
				const response = await apiClient.get("/roles");
				setAvailableRoles(response.data);
				
				if (response.data.length > 0) {
					setSelectedRole(response.data[0].name);
				}
				
			} catch (error) {
				console.error("Failed to fetch roles", error);
				notifications.show({
					title: "Error",
					message: "Failed to load roles",
					color: "red"
			});
		}
	};
		fetchRoles();
	}, []);

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

		if (!selectedRole) {
			notifications.show({
				title: "Validation Error",
				message: "Please select a role!",
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
				role: selectedRole
			});

			if (response.status == 201) {
				notifications.show({
					title: "Registration Successful",
                    message: response.data.message || "Your account has been created!",
                    color: "green",
                    autoClose: 5000,
				});

				if (onSuccess) {
					onSuccess();
				}

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
				if (error.response.status === 409) {
					errorMessage = error.response.data.message || "Username or Email already exists.";
                    errorTitle = "Duplicate Entry";
                    errorColor = "orange";
				} else {
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
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.currentTarget.value)}
					required
					mt="sm"
					leftSection={<IconAt size={16} />}
				/>
				<TextInput
					placeholder="First Name"
					value={firstName}
					onChange={(e) => setFirstName(e.currentTarget.value)}
					required
					mt="sm"
					leftSection={<IconUser size={16} />}
				/>
				<TextInput
					placeholder="Last Name"
					value={lastName}
					onChange={(e) => setLastName(e.currentTarget.value)}
					mt="sm"
					leftSection={<IconUser size={16} />}
				/>
				<TextInput
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
					required
					mt="sm"
					leftSection={<IconMail size={16} />}
				/>
				<Select
					placeholder="Select user role"
					data={availableRoles.map(role => ({ value: role.name, label: role.name }))}
					value={selectedRole}
					onChange={setSelectedRole}
					required
					mt="sm"
					leftSection={<IconShield size={16} />}
				/>
				
				<Text size="sm" c="dimmed" ta="center">
					User will receive an email with instructions to set their password.
				</Text>

				<Button 
					fullWidth 
					mt="md" 
					onClick={handleRegister} 
					color="#A91D3A" 
					loading={isLoading}
					type="submit"
				>
					Register
				</Button>
			</Stack>
		</form>
	);
}