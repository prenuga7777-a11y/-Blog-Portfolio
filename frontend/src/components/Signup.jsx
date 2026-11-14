import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);

            setSuccess("Registration successful!");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            console.error(error);

            if (error.code === "auth/email-already-in-use") {
                setError("Email already registered");
            } else if (error.code === "auth/weak-password") {
                setError("Password must contain at least 6 characters");
            } else if (error.code === "auth/invalid-email") {
                setError("Invalid email address");
            } else {
                setError("Registration failed. Please try again.");
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="p-10 bg-white rounded-lg shadow-lg"
                style={{ width: "70%" }}
            >
                <h2 className="text-2xl font-bold mb-5 text-gray-800">
                    Sign Up
                </h2>

                <div className="mb-4">
                    <label className="block text-gray-700">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 p-2 w-full border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 p-2 w-full border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">
                        Confirm Password:
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="mt-1 p-2 w-full border rounded"
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-3">{error}</p>
                )}

                {success && (
                    <p className="text-green-600 text-sm mb-3">{success}</p>
                )}

                <p
                    className="text-blue-600 cursor-pointer my-2"
                    onClick={() => navigate("/login")}
                >
                    Already have an account? Login here
                </p>

                <button
                    type="submit"
                    className="bg-orange-400 text-white py-2 px-4 rounded hover:bg-orange-600 transition duration-200 ease-in-out"
                >
                    Register
                </button>
            </form>
        </div>
    );
}

export default Signup;