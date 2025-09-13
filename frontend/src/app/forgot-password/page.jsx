import EmailRequestForm from "@/components/auth/EmailRequestForm";
import { Paper, Title, Text } from "@mantine/core";

export default function ForgotPasswordPage() {
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
                <Title order={3} mb="xs" ta="center" className="text-[#A91D3A]">
                    Forget Password?
                </Title>
                
                <Text size="sm" ta="center" mb="lg">
                    Enter your Registered Email Address
                </Text>
                <EmailRequestForm />
            </Paper>
        </div>
    );
}