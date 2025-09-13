"use client";

import { Container, Paper, Title } from "@mantine/core";
import OtpVerificationForm from "@/components/auth/OtpVerificationForm";

export default function OtpVerifyPage() {
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
                    <Title
						align="center"
						className="text-xl md:text-2xl text-black"
					>
                        Verify OTP
                    </Title>

                    <p className="text-center text-sm mt-4" style={{ color: "#7E99A3" }}>
						We’ve sent a 6-digit code to your email. Please check your inbox and
						enter it here.
					</p>

                    <OtpVerificationForm />
                </Paper>
            </Container>
        </div>
    );
}
