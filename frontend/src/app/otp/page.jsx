"use client";

import { useState } from "react";
import {
    Container,
    Paper,
    Title,
    Center,
    Text
} from "@mantine/core";
import OtpForm from "@/components/auth/OtpForm";

export default function OtpPage() {
    return (
        <div className="min-h-screen bg-gradient-to-r from-[#A91D3A] to-[#EE4266] px-4 flex items-center justify-center">
            <Container size={600} my={40}>
                <Paper
                    withBorder
                    shadow="md"
                    p={30}
                    mt={30}
                    radius="md"
                    className="w-full max-w-md bg-white"
                >
                    <Title align="center" mb="md" className="text-xl md:text-2xl text-black">
                        Verify OTP
                    </Title>

                    {/* Judul Halaman */}
                    <Title align="center" size="sm" mb="lg" style={{ color: '#7E99A3' }}>
                        We’ve sent a 6-digit code to your email. Please check your inbox and enter it here.
                    </Title>

                    <OtpForm />

                    <Center mt="xl" style={{ flexDirection: "column" }}>
                        <Text color="black">Didn't receive the code?</Text>
                        <Text size="sm" color="blue" className="cursor-pointer"> Resend OTP </Text>
                    </Center>
                </Paper>
            </Container>
        </div>
    );
}