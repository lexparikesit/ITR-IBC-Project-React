"use client";

import { useState } from "react";
import { Paper, Container, Anchor, Center, Text } from "@mantine/core";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-gradient-to-r from-[#A91D3A] to-[#EE4266] px-4 flex items-center justify-center">
			<Paper
				withBorder
				shadow="md"
				p="xl"
				radius="md"
				w={{ base: "100%" }}
				maw={360}
				className="w-full max-w-md"
			>
				<h1 className="text-center font-semibold text-xl md:text-2xl text-[#A91D3A]">
					Login User
				</h1>

				<LoginForm />

				<Center mt="xl" style={{ flexDirection: "column" }}>
					<Text style={{ color: "#A91D3A" }}>Don't have an account?</Text>
					<Anchor href="/register" size="sm" component={Link}>
						Sign up Here!
					</Anchor>
				</Center>
			</Paper>
		</div>
	);
}
