import {
	Anchor,
	Button,
	Checkbox,
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

	const handleLogin = async () => {
		try {
			const response = await fetch("http://localhost:5000/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include", // Include cookies for session management
				body: JSON.stringify({ username, password, remember }),
			});

			const data = await response.json();
			console.log(data);

			if (response.ok) {
				alert("Login Successfully!");
				localStorage.setItem("otp_sent", "true"); // Set flag for OTP sent
				router.push("/otp"); // Redirect to OTP page
			} else {
				alert(data.message || "Login Failed!");
			}
		} catch (error) {
			console.error("Login error:", error);
		}
	};

	const inputStyles = {
            label: { color: '#A91D3A' },
            input: {
                borderColor: '#151515',
                color: '#333',
                backgroundColor: '#fff',
                },
            placeholder: { color: '#aaa' }
        }

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
				mt="md"
				styles={inputStyles}
			/>

			<Group position="apart" mt="xs">
				<Checkbox
					label="Remember Me"
					checked={remember}
					onChange={(e) => setRemember(e.currentTarget.checked)}
					styles={inputStyles}
				/>
				<Anchor href="#" size="sm">
					{" "}
					Forget Password{" "}
				</Anchor>
			</Group>

			<Button fullWidth mt="xl" onClick={handleLogin} color="#A91D3A">
				Login
			</Button>
		</Stack>
	);
};

export default LoginForm;
