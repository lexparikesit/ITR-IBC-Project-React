'use client';

import { useState } from "react";
import {
    Paper,
    Title,
    Container,
    Anchor,
    Center,
    Text
} from '@mantine/core';
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-r from-[#A91D3A] to-[#EE4266] px-4 flex items-center justify-center">
            <Container size="xs">
                <Paper
                    withBorder
                    shadow="md"
                    p={30}
                    radius="md"
                    className="w-full max-w-md bg-white"
                >

                    <Title align="center" order={2} mb="md" className="text-[#A91D3A]">Register your Account</Title>

                    <RegisterForm />

                    <Center mt="xl" style={{ flexDirection: 'column' }}>
                        <Text color="black" size="sm">Already have an account?</Text>
                        <Anchor href="/login" size="sm">Login Here!</Anchor>
                    </Center>
                </Paper>
            </Container>
        </div>
    );
}