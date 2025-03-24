import { useAuth } from "@/providers/auth-provider";
import { Navigate, Outlet } from "react-router";

const PrivateRoute = () => {
    const { user, isGettingUser, auth } = useAuth();

    if (!auth.token) {
        return <Navigate to="/sign-in" replace />;
    }

    if (isGettingUser) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">
                        Đang xác thực...
                    </p>
                </div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export default PrivateRoute;
