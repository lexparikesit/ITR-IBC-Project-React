import {
	Anchor,
	Button,
	Checkbox,
	Flex,
	Group,
	PasswordInput,
	Stack,
	TextInput,
} from "@mantine/core";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);
	const router = useRouter();

	const handleLogin = async (e) => {
		
		e.preventDefault(); 
		
		try {
			const response = await fetch("http://localhost:5000/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include", // Include cookies for session management
				body: JSON.stringify({ username, password, remember }),
			});

			const data = await response.json();
			console.log("Login API Response:", data);

			if (response.ok) {
				if (data.user_id) {
					localStorage.setItem("user_id", data.user_id);
					console.log("User ID stored in localStorage:", data.user_id);
					localStorage.setItem("otp_sent", "true");
					alert("OTP Sent to Your Email!");
					router.push('/otp');
				} else {
					console.error("Login successful but user_id missing in response:", data);
                    alert("Login successful, but User ID was not provided. Please contact support.");
				}
			} else {
				console.error("Login failed:", data.error);
                alert(data.error || "Login Failed. Please check your credentials.");	
			}
		} catch (error) {
			console.error("Network error during login:", error); // <-- LOG INI
            alert("Network error. Please try again.");
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
		<Stack>
			<TextInput
				label="Username"
				placeholder="username"
				value={username}
				onChange={(e) => setUsername(e.currentTarget.value)}
				required
				styles={inputStyles}
			/>

			<PasswordInput
				label="Password"
				placeholder="••••••••"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
				styles={inputStyles}
			/>

			<Flex justify="space-between" w="100%" mt="xs">
				<Checkbox
					label="Remember Me"
					checked={remember}
					onChange={(e) => setRemember(e.currentTarget.checked)}
					styles={inputStyles}
				/>
				<Anchor href="#" size="sm">
					Forget Password
				</Anchor>
			</Flex>

			<Button fullWidth mt="xl" onClick={handleLogin} color="#A91D3A">
				Login
			</Button>
		</Stack>
	);
};

export default LoginForm;
