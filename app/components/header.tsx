import { Link } from "react-router";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";

const Header = () => {
    const { auth, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
            {/* Logo */}
            <div className="flex items-center">
                <Link to="/" className="text-purple-500 text-2xl font-bold">
                    ✶
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-6 text-purple-500 font-medium">
                <Link to="/page">Page</Link>
            </nav>

            {/* User Profile with Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                >
                    <span className="text-gray-800 font-semibold">TOAN</span>
                    <FaUserCircle className="text-gray-800 text-2xl cursor-pointer" />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut();
                            }}
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
