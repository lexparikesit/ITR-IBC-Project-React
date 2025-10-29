import {
	Anchor,
	Button,
	Flex,
	PasswordInput,
	TextInput,
	Box,
} from "@mantine/core";
import { IconAt, IconLock } from "@tabler/icons-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await apiClient.post("/login", {
				username: username,
				password: password,
			});

			const data = response.data;

			console.log("Login API Response:", data);

			if (response.status === 200 && data.message === "OTP Sent to Your Email!" && data.email) {
				localStorage.setItem("user_email_for_otp", data.email);
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
                    "Unexpected Response From /api/login",
                    data
				);
				notifications.show({ 
                    title: "Login Failed",
                    message: "Login successful, but required data was not provided by the server. Please contact support.",
                    color: "red",
                    autoClose: 5000,
                });
			}

		} catch (error) {
			console.error("Network error during login:", error);
            const errorMessage = error.response?.data?.message || "Network error. Please try again.";
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
	
	return (
		<div>
			<Box component="form" onSubmit={handleLogin}>
				<TextInput
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.currentTarget.value)}
					required
					mt="sm"
					leftSection={<IconAt size={16} />}
				/>

				<PasswordInput
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.currentTarget.value)}
					required
					mt="sm"
					leftSection={<IconLock size={16} />}
				/>

				<Flex justify="space-between" w="100%" mt="lg">
					<div></div>
					<Anchor href="/forgot-password" size="sm">
						Forget Password
					</Anchor>
				</Flex>

				<Button 
					fullWidth 
					mt="lg" 
					color="#A91D3A" 
					type="submit"
					loading={isLoading}
					>
						Login
				</Button>
			</Box>
		</div>
	);
};

export default LoginForm;
