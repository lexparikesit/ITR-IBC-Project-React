'use client';

import { useState } from "react";
import {
    TextInput,
    PasswordInput,
    Paper,
    Title,
    Container,
    Button,
    Anchor,
    Stack,
    Center,
    Text
} from '@mantine/core';

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleRegister = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration Successful!');
            } else {
                alert(data.message || 'Registration Failed!');
            }
        } catch (error) {
            console.error("Registration Error!", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-200 to-blue-200 flex items-center justify-center px-4">
            <Container size="xs">
                <Paper
                    withBorder
                    shadow="md"
                    p={30}
                    radius="md"
                    className="w-full max-w-md bg-white"
                >

                    <Title align="center" order={2} mb="md">Register your Account</Title>

                    <Stack spacing="sm">
                        <TextInput
                            label="Username"
                            placeholder="username"
                            value={form.username}
                            onChange={(e) => handleChange('username', e.currentTarget.value)}
                            required
                        />

                        <TextInput
                            label="First Name"
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={(e) => handleChange('firstName', e.currentTarget.value)}
                            required
                        />

                        <TextInput
                            label="Last Name"
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={(e) => handleChange('lastName', e.currentTarget.value)}
                            required
                        />

                        <TextInput
                            label="Email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.currentTarget.value)}
                        />

                        <PasswordInput
                            label="Password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => handleChange('password', e.currentTarget.value)}
                            required
                        />

                        <PasswordInput
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.currentTarget.value)}
                            required
                        />

                        <Button fullWidth mt="md" onClick={handleRegister}>
                            Register
                        </Button>
                    </Stack>

                    <Center mt="xl" style={{ flexDirection: 'column' }}>
                        <Text size="sm">Already have an account?</Text>
                        <Anchor href="/login" size="sm">Login Here!</Anchor>
                    </Center>
                </Paper>
            </Container>
        </div>
    );
}