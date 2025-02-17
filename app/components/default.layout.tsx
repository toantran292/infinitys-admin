import {Outlet} from "react-router";
import Header from "~/components/header";

const DefaultLayout = () => {
    return (
        <>
            <Header />
            <div>
                <Outlet />
            </div>
        </>
    );
}

export default DefaultLayout;