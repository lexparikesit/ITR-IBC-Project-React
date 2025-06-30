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

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);

	const handleLogin = async () => {
		try {
			const response = await fetch("http://localhost:5000/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password, remember }),
			});

			const data = await response.json();
			console.log(data);

			if (response.ok) {
				alert("Login Successfully!");
			} else {
				alert(data.message || "Login Failed!");
			}
		} catch (error) {
			console.error("Login error:", error);
		}
	};
	return (
		<Stack>
			<TextInput
				label="Username"
				placeholder="username"
				value={username}
				onChange={(e) => setUsername(e.currentTarget.value)}
				required
			/>

			<PasswordInput
				label="Password"
				placeholder="••••••••"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
				mt="md"
			/>

			<Group position="apart" mt="xs">
				<Checkbox
					label="Remember Me"
					checked={remember}
					onChange={(e) => setRemember(e.currentTarget.checked)}
				/>
				<Anchor href="#" size="sm">
					{" "}
					Forget Password{" "}
				</Anchor>
			</Group>

			<Button fullWidth mt="xl" onClick={handleLogin}>
				Login
			</Button>
		</Stack>
	);
};

export default LoginForm;
