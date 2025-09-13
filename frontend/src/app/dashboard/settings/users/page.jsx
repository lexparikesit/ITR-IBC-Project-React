'use client';

import { useState, useEffect } from 'react';
import { Paper, Text, PasswordInput, Button, Divider, Stack, TextInput, Title, Box, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import apiClient from '@/libs/api';

export default function UserSettingsPage() {
    const [userData, setUserData] = useState(null);

    const [isEditingFirstName, setIsEditingFirstName] = useState(false);
    const [isEditingLastName, setIsEditingLastName] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');

    const [firstNamePassword, setFirstNamePassword] = useState('');
    const [lastNamePassword, setLastNamePassword] = useState('');
    const [usernamePassword, setUsernamePassword] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await apiClient.get('/profile');
                setUserData(response.data);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load user information.',
                    color: 'red',
                });
            }
        };
        fetchUserData();
    }, []);

    const handleFirstNameChange = async (e) => {
        e.preventDefault();
        if (!newFirstName || !firstNamePassword) return;

        setIsLoading(true);
        
        try {
            const response = await apiClient.post('/update-first-name', {
                new_first_name: newFirstName,
                password: firstNamePassword,
            });
            notifications.show({
                title: 'Success',
                message: response.data.message || 'First name updated.',
                color: 'green',
            });
            setNewFirstName('');
            setFirstNamePassword('');
            setUserData(prev => ({ ...prev, first_name: newFirstName }));
            setIsEditingFirstName(false);

        } catch (error) {
            console.error('First name update failed:', error);
            notifications.show({
                title: 'Failed',
                message: error.response?.data?.message || 'Failed to update first name.',
                color: 'red',
            });

        } finally {
            setIsLoading(false);
        }
    };

    const handleLastNameChange = async (e) => {
        e.preventDefault();
        if (!newLastName || !lastNamePassword) return;

        setIsLoading(true);
        
        try {
            const response = await apiClient.post('/update-last-name', {
                new_last_name: newLastName,
                password: lastNamePassword,
            });
            notifications.show({
                title: 'Success',
                message: response.data.message || 'Last name updated.',
                color: 'green',
            });
            setNewLastName('');
            setLastNamePassword('');
            setUserData(prev => ({ ...prev, last_name: newLastName }));
            setIsEditingLastName(false);

        } catch (error) {
            console.error('Last name update failed:', error);
            notifications.show({
                title: 'Failed',
                message: error.response?.data?.message || 'Failed to update last name.',
                color: 'red',
            });

        } finally {
            setIsLoading(false);
        }
    };

    const handleUsernameChange = async (e) => {
        e.preventDefault();
        if (!newUsername || !usernamePassword) return;

        setIsLoading(true);

        try {
            const response = await apiClient.post('/update-username', {
                new_username: newUsername,
                password: usernamePassword,
            });
            notifications.show({
                title: 'Success',
                message: response.data.message || 'Username updated.',
                color: 'green',
            });
            setNewUsername('');
            setUsernamePassword('');
            setUserData(prev => ({ ...prev, username: newUsername }));
            setIsEditingUsername(false);

        } catch (error) {
        console.error('Username update failed:', error);
        notifications.show({
            title: 'Failed',
            message: error.response?.data?.message || 'Failed to update username.',
            color: 'red',
        });

        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
        if (!newEmail || !emailPassword) return;

        setIsLoading(true);
        
        try {
            const response = await apiClient.post('/update-email', {
                new_email: newEmail,
                password: emailPassword,
            });
            notifications.show({
                title: 'Success',
                message: response.data.message || 'Email updated.',
                color: 'green',
            });
            setNewEmail('');
            setEmailPassword('');
            setUserData(prev => ({ ...prev, email: newEmail }));
            setIsEditingEmail(false);

        } catch (error) {
            console.error('Email update failed:', error);
            notifications.show({
                title: 'Failed',
                message: error.response?.data?.message || 'Failed to update email.',
                color: 'red',
            });

        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            notifications.show({ 
                title: 'Failed', 
                message: 'New passwords do not match.', 
                color: 'red' 
            });
            return;
        }
        
        setIsLoading(true);

        try {
            const response = await apiClient.post('/update-password', {
                old_password: oldPassword,
                new_password: newPassword,
            });
            notifications.show({
                title: 'Success',
                message: response.data.message || 'Password updated.',
                color: 'green',
            });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsEditingPassword(false);

        } catch (error) {
            console.error('Password change failed:', error);
            notifications.show({ 
                title: 'Failed', 
                message: error.response?.data?.message || 'Failed to change password.', 
                color: 'red' 
            });

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box maw="100%" mx="auto" px="md">
            <Title order={1} mt="md" mb="lg" style={{ color: '#000000 !important' }}> Account Settings </Title>
            <Text c="dimmed" mb="xl"> Edit your Name (First or Last Name), Username, Email and Password. </Text>

            <Paper shadow="sm" p="xl" withBorder>
                {/* First Name Section */}
                <Stack gap="sm" mb="md">
                    <Text size="sm" style={{ fontWeight: 500 }}>First Name</Text>
                    {isEditingFirstName ? (
                        <form onSubmit={handleFirstNameChange}>
                        <TextInput
                            placeholder="Enter new first name"
                            value={newFirstName}
                            onChange={(e) => setNewFirstName(e.currentTarget.value)}
                            required
                            mb="sm"
                        />
                        <PasswordInput
                            placeholder="Confirm with password"
                            value={firstNamePassword}
                            onChange={(e) => setFirstNamePassword(e.currentTarget.value)}
                            required
                        />
                        <Group mt="md">
                            <Button type="submit" loading={isLoading}>Save</Button>
                            <Button variant="subtle" onClick={() => setIsEditingFirstName(false)}>Cancel</Button>
                        </Group>
                        </form>
                    ) : (
                        <Group justify="space-between" align="center">
                        <Text c="dimmed">{userData?.first_name || 'Loading...'}</Text>
                        <Button variant="subtle" onClick={() => setIsEditingFirstName(true)}>Change</Button>
                        </Group>
                    )}
                </Stack>

                <Divider my="sm" />

                {/* Last Name Section */}
                <Stack gap="sm" mb="md">
                    <Text size="sm" style={{ fontWeight: 500 }}>Last Name</Text>
                    {isEditingLastName ? (
                        <form onSubmit={handleLastNameChange}>
                            <TextInput
                                placeholder="Enter new last name"
                                value={newLastName}
                                onChange={(e) => setNewLastName(e.currentTarget.value)}
                                required
                                mb="sm"
                            />
                            <PasswordInput
                                placeholder="Confirm with password"
                                value={lastNamePassword}
                                onChange={(e) => setLastNamePassword(e.currentTarget.value)}
                                required
                            />
                            <Group mt="md">
                                <Button type="submit" loading={isLoading}>Save</Button>
                                <Button variant="subtle" onClick={() => setIsEditingLastName(false)}>Cancel</Button>
                            </Group>
                        </form>
                    ) : (
                        <Group justify="space-between" align="center">
                            <Text c="dimmed">{userData?.last_name || 'Loading...'}</Text>
                            <Button variant="subtle" onClick={() => setIsEditingLastName(true)}>Change</Button>
                        </Group>
                    )}
                </Stack>
                
                <Divider my="sm" />

                {/* Username Section */}
                <Stack gap="sm" mb="md">
                    <Text size="sm" style={{ fontWeight: 500 }}>Username</Text>
                    {isEditingUsername ? (
                        <form onSubmit={handleUsernameChange}>
                            <TextInput
                                placeholder="Enter new username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.currentTarget.value)}
                                required
                                mb="sm"
                            />
                            <PasswordInput
                                placeholder="Confirm with password"
                                value={usernamePassword}
                                onChange={(e) => setUsernamePassword(e.currentTarget.value)}
                                required
                            />
                            <Group mt="md">
                                <Button type="submit" loading={isLoading}>Save</Button>
                                <Button variant="subtle" onClick={() => setIsEditingUsername(false)}>Cancel</Button>
                            </Group>
                        </form>
                    ) : (
                        <Group justify="space-between" align="center">
                            <Text c="dimmed">{userData?.username || 'Loading...'}</Text>
                            <Button variant="subtle" onClick={() => setIsEditingUsername(true)}>Change</Button>
                        </Group>
                    )}
                </Stack>

                <Divider my="sm" />

                {/* Email Section */}
                <Stack gap="sm" mb="md">
                    <Text size="sm" style={{ fontWeight: 500 }}>Email Address</Text>
                    {isEditingEmail ? (
                        <form onSubmit={handleEmailChange}>
                            <TextInput
                                placeholder="new.email@example.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.currentTarget.value)}
                                required
                                mb="sm"
                            />
                            <PasswordInput
                                placeholder="Confirm with password"
                                value={emailPassword}
                                onChange={(e) => setEmailPassword(e.currentTarget.value)}
                                required
                            />
                            <Group mt="md">
                                <Button type="submit" loading={isLoading}>Save</Button>
                                <Button variant="subtle" onClick={() => setIsEditingEmail(false)}>Cancel</Button>
                            </Group>
                        </form>
                    ) : (
                        <Group justify="space-between" align="center">
                            <Text c="dimmed">{userData?.email || 'Loading...'}</Text>
                            <Button variant="subtle" onClick={() => setIsEditingEmail(true)}>Change</Button>
                        </Group>
                    )}
                </Stack>

                <Divider my="sm" />

                {/* Password Section */}
                <Stack gap="sm" mb="md">
                    <Text size="sm" style={{ fontWeight: 500 }}>Password</Text>
                    {isEditingPassword ? (
                        <form onSubmit={handlePasswordChange}>
                            <PasswordInput
                                placeholder="Current password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.currentTarget.value)}
                                required
                                mb="sm"
                            />
                            <PasswordInput
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.currentTarget.value)}
                                required
                                mb="sm"
                            />
                            <PasswordInput
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                                required
                            />
                            <Group mt="md">
                                <Button type="submit" loading={isLoading}>Save</Button>
                                <Button variant="subtle" onClick={() => setIsEditingPassword(false)}>Cancel</Button>
                            </Group>
                        </form>
                    ) : (
                        <Group justify="space-between" align="center">
                            <Text c="dimmed">************</Text>
                            <Button variant="subtle" onClick={() => setIsEditingPassword(true)}>Change</Button>
                        </Group>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}