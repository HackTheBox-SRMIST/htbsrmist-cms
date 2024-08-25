import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/SignUp.module.css";
import Link from "next/link";

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Sign-up data:", formData);

        router.push("/home");
    };

    return (
        <div className={styles.signupContainer}>
            <form className={styles.signupForm} onSubmit={handleSubmit}>
                <h2 className={styles.title}>
                    <img src="/logo.webp" alt="logo" className={styles.logo} /> Sign-Up
                </h2>
                <div className={styles.inputGroup}>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        required
                        onChange={handleChange}
                        value={formData.name}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email ID</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                        onChange={handleChange}
                        value={formData.email}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                        onChange={handleChange}
                        value={formData.password}
                    />
                </div>
                <button type="submit" className={styles.signupButton}>
                    Sign Up
                </button>
                <div className={styles.linkContainer}>
                    <span className={styles.text}>Already have an account? </span>
                    <Link href="/login" className={styles.loginLink}>
                        Login
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default SignUp;