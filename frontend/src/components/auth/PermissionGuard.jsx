"use client";

import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader, Alert } from "@mantine/core";

const PermissionGuard = ({
    permission,
    children,
    redirectTo = "/",
    loadingComponent = null
}) => {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user && !user.permissions?.includes(permission)) {
            router.push(redirectTo);
        }
    }, [user, loading, permission, redirectTo, router]);

    if (loading) {
        if (loadingComponent) {
            return loadingComponent;
        }
        return (
            <Center h="80vh">
                <Loader size="lg" />
            </Center>
        );
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    if (!user.permissions?.includes(permission)) {
        return (
            <Center h="80vh">
                <Alert color="red" title="Access Denied">
                    You don't have permission to access this page.
                </Alert>
            </Center>
        );
    }

    return children;
};

export default PermissionGuard;