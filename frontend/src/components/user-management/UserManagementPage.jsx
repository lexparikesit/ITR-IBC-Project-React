"use client";

import {
    Table,
    Button,
    Group,
    Badge,
    ActionIcon,
    Modal,
    Radio,
    Stack,
    Title,
    Text,
    TextInput,
    Pagination,
    Select,
    Paper,
} from "@mantine/core";
import { IconPlus, IconPencil, IconUserOff, IconUserCheck, IconSearch } from '@tabler/icons-react';
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";
import PermissionGuard from "@/components/auth/PermissionGuard";
import RegisterForm from "@/components/auth/RegisterForm";

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openedRoleModal, setOpenedRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState("10");
    const [openedAddUser, setOpenedAddUser] = useState(false);
    const ITEMS_PER_PAGE = parseInt(rowsPerPage, 10);
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                apiClient.get('/users'),
                apiClient.get("/roles"),
            ]);

            setUsers(usersRes.data);
            setAvailableRoles(rolesRes.data);
        
        } catch (error) {
            console.error("Failed to fetch Data", error);
            notifications.show({
                title: "Error",
                message: "Failed to Load Users",
                color: "red",
            });

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleActive = async (user) => {
        try {
            await apiClient.patch(`/users/${user.id}/toggle-active`);
            setUsers(users.map(u => 
                u.id === user.id ? { ...u, is_active: !u.is_active } : u
            ));

            notifications.show({
                title: "Success",
                message: `User ${user.is_active ? "deactivated" : "activated"}`,
                color: "green",
            });

        } catch (error) {
            notifications.show({ 
                title: "Error", 
                message: "Failed to update status", 
                color: "red"
            });
        }
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setSelectedRoles(user.roles);
        setOpenedRoleModal(true);
    };

    const saveRoles = async () => {
        try {
            await apiClient.post(`/users/${selectedUser.id}/assign-roles`, {
                roles_names: selectedRoles,
            });

            setUsers(users.map(u =>
                u.id === selectedUser.id ? { ...u, roles: selectedRoles } : u
            ));

            setOpenedRoleModal(false);
            notifications.show({ 
                title: "Success", 
                message: "Roles updated", 
                color: "green" 
            });

        } catch (error) {
            notifications.show({ 
                title: "Error", 
                message: "Failed to update roles", 
                color: "red" 
            });
        }
    };

    const rows = paginatedUsers.map((user, index) => (
        <Table.Tr key={user.id}>
            <Table.Td>{startIndex + index + 1}</Table.Td>
            <Table.Td>{user.username}</Table.Td>
            <Table.Td>{user.firstName}</Table.Td>
            <Table.Td>{user.lastName}</Table.Td>
            <Table.Td>{user.email}</Table.Td>
            <Table.Td>
                <Group gap="xs">
                    {user.roles.map((role) => (
                        <Badge key={role} variant="light" color="blue">
                            {role}
                        </Badge>
                    ))}
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge color={user.is_active ? "green" : "gray"}>
                    {user.is_active ? "Active" : "Inactive"}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Group gap="xs" wrap="nowrap">
                    <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => openRoleModal(user)}
                        title="Manage Roles"
                    >
                        <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color={user.is_active ? "red" : "green"}
                        onClick={() => toggleActive(user)}
                        title={user.is_active ? "Deactivate" : "Activate"}
                    >
                        {user.is_active ? <IconUserOff size={16} /> : <IconUserCheck size={16} />}
                    </ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <PermissionGuard permission="manage_users">
            <div className="p-6">
                <Group justify="center" mb="md">
                    <Title order={1}>User Management</Title>
                </Group>
                    <Text ta="center" c="dimmed" mb="md">Total Users: {users.length}</Text>

                <Paper shadow="sm" radius="md" p="md" mb="md">
                    <Group 
                        justify="space-between" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            height: '40px'
                        }} 
                        mb="md"
                    >
                        <TextInput
                            label="Search Users"
                            icon={<IconSearch size={14} />}
                            placeholder="by First or Last Name, Username, Email, or Roles"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.currentTarget.value);
                                setPage(1);
                            }}
                            w={400}
                            style={{ alignSelf: 'center' }} 
                        />
                        <Group>
                            <Select
                                label="Show Rows"
                                placeholder="10"
                                data={['10', '20', '30', '50', '100']}
                                value={rowsPerPage}
                                onChange={(value) => {
                                    setRowsPerPage(value);
                                    setPage(1);
                                }}
                                w={80}
                            />
                            <ActionIcon
                                variant="filled"
                                color="#A91D3A"
                                size="lg"
                                onClick={() => setOpenedAddUser(true)}
                                title="Add User"
                                style={{ 
                                    height: '100%',
                                    width: '40px',
                                    paddingTop: '2px',
                                    paddingBottom: '2px',
                                    marginTop: '21px'
                                }}
                            >
                                <IconPlus size={18} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Paper>

                <Paper shadow="sm" radius="md" p="md">
                    <Table stickyHeader striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                            <Table.Th>No.</Table.Th>
                            <Table.Th>Username</Table.Th>
                            <Table.Th>First Name</Table.Th>
                            <Table.Th>Last Name</Table.Th>
                            <Table.Th>Email</Table.Th>
                            <Table.Th>Roles</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Action</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {loading ? (
                                <Table.Tr>
                                    <Table.Td colSpan={8} ta="center">
                                        Loading...
                                    </Table.Td>
                                </Table.Tr>
                            ) : filteredUsers.length === 0 && searchTerm ? (
                                <Table.Tr>
                                    <Table.Td colSpan={8} ta="center">
                                        No users match your search
                                    </Table.Td>
                                </Table.Tr>
                            ) : rows.length > 0 ? (
                            rows
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={8} ta="center">
                                        No users found
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>

                    {totalPages > 1 && (
                        <Group justify="center" mt="md">
                            <Pagination
                                total={totalPages}
                                value={page}
                                onChange={setPage}
                                color="#A91D3A"
                                withEdges
                            />
                        </Group>
                    )}

                    <Modal
                        opened={openedRoleModal}
                        onClose={() => setOpenedRoleModal(false)}
                        title={`Manage Roles for ${selectedUser?.firstName} ${selectedUser?.lastName}`}
                    >
                        <Stack>
                            <Radio.Group
                                value={selectedRoles[0] || ''}
                                onChange={(value) => setSelectedRoles([value])}
                            >
                            {availableRoles.map((role) => (
                                <Radio
                                    key={role.name}
                                    value={role.name}
                                    label={role.name}
                                    mb="xs"
                                />
                            ))}
                            </Radio.Group>

                            <Button onClick={saveRoles} color="#A91D3A" mt="md">
                                Save Roles
                            </Button>
                        </Stack>
                    </Modal>
                    <Modal
                        opened={openedAddUser}
                        onClose={() => setOpenedAddUser(false)}
                        title="Add New User"
                        size="lg"
                    >
                        <RegisterForm 
                            onSuccess={() => {
                                setOpenedAddUser(false);
                                fetchData();
                            }} 
                        />
                    </Modal>
                </Paper>
            </div>
        </PermissionGuard>
    );
};

export default UserManagementPage;