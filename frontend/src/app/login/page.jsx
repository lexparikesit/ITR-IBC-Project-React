"use client";

import { useState } from "react";
import {
	TextInput,
	PasswordInput,
	Checkbox,
	Paper,
	Title,
	Container,
	Button,
	Group,
	Anchor,
	Stack,
	Center,
	Text,
} from "@mantine/core";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center">
			<Container size={600} my={40}>
				<Paper
					withBorder
					shadow="md"
					p={30}
					mt={30}
					radius="md"
					className="w-full max-w-md bg-white"
				>
					<h1 align="center" mb="md" className="text-xl md:text-2xl text-black">
						Login User
					</h1>

					<LoginForm />

					<Center mt="xl" style={{ flexDirection: "column" }}>
						<Text>Don't have an account?</Text>
						<Anchor href="/register" size="sm">
							Sign up Here!
						</Anchor>
					</Center>
				</Paper>
			</Container>
		</div>
	);
}
