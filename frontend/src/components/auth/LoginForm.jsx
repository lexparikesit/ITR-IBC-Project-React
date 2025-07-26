import {
	Anchor,
	Button,
	Checkbox,
	Flex,
	PasswordInput,
	TextInput,
} from "@mantine/core";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);
	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();

		try {
			const response = await apiClient.post("/auth/login", {
				username,
				password,
				remember,
			});

			const data = response.data;

			console.log("Login API Response:", data);

			if (data.user_id) {
				localStorage.setItem("user_id", data.user_id);
				console.log("User ID stored in localStorage:", data.user_id);
				localStorage.setItem("otp_sent", "true");
				notifications.show({
					title: "OTP is sent!",
					message: "Check your email for the OTP.",
					autoClose: 5000,
					position: "top-center",
					color: "orange",
				});
				router.push("/otp");
			} else {
				console.error(
					"Login successful but user_id missing in response:",
					data
				);
				alert(
					"Login successful, but User ID was not provided. Please contact support."
				);
			}
		} catch (error) {
			console.error("Network error during login:", error); // <-- LOG INI
			alert("Network error. Please try again.");
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
				mt="sm"
			/>

			<PasswordInput
				label="Password"
				placeholder="••••••••"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
				mt="sm"
			/>

			<Flex justify="space-between" w="100%" mt="lg">
				<Checkbox
					label="Remember Me"
					checked={remember}
					onChange={(e) => setRemember(e.currentTarget.checked)}
					// styles={inputStyles}
				/>
				<Anchor href="#" size="sm">
					Forget Password
				</Anchor>
			</Flex>

			<Button fullWidth mt="lg" onClick={handleLogin} color="#A91D3A">
				Login
			</Button>
		</div>
	);
};

export default LoginForm;
