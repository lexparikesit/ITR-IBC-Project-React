import { Suspense } from "react";
import { Paper, Title } from "@mantine/core";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
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
                <Title order={3} ta="center" mb="xl" className="text-[#A91D3A]">
                    Reset Password
                </Title>

                <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </Paper>
        </div>
    );
}