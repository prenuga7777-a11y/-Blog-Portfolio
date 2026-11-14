import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import "./Navbar.css";

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Logout Error:", error);
            alert("Logout failed. Please try again.");
        }
    };

    return (
        <nav className="flex justify-between items-center p-5 bg-white shadow-md">
            <h1 className="text-2xl font-bold">Personal</h1>

            <div className="flex gap-6 items-center">
                <Link to="/home">Home</Link>

                <Link to="/blogs">Blogs</Link>

                <Link to="/about">About</Link>

                {user ? (
                    <button
                        onClick={handleLogout}
                        className="button-style"
                    >
                        Logout
                    </button>
                ) : (
                    <Link to="/login" className="button-style">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;