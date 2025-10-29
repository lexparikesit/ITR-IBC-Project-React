"use client";

import { useState } from "react";
import { 
	Paper, 
	Container, 
	Anchor, 
	Center, 
	Text,
	Title,
} from "@mantine/core";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-gradient-to-r from-[#A91D3A] to-[#EE4266] px-4 flex items-center justify-center">
			<div className="text-center mb-8 w-full max-w-md">
				<Title
					order={1}
					c="white"
					ta="center"
					fw={500}
					size="3rem"
					className="font-sans leading-tight"
				>
					Welcome Back!
				</Title>
				<Text
					size="lg"
					c="white"
					ta="center"
					mt="xs"
					opacity={0.95}
					className="font-medium tracking-wide"
				>
					Indotraktor IBC Portal
				</Text>
			</div>

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
			</Paper>
		</div>
	);
}
