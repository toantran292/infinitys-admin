import {useAuth} from "~/providers/auth-provider";
import {Navigate, Outlet} from "react-router";

const PrivateRoute = () => {
    const { auth } = useAuth();

    return auth.user?.email ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export default PrivateRoute;
