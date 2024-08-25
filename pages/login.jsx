import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/login.module.css";
import Link from "next/link";

const Login = () => {
    const [formData, setFormData] = useState({
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
        console.log("Login data:", formData);

        router.push("/home");
    };

    return (
        <div className={styles.loginContainer}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <h2 className={styles.title}>
                    <img src="/logo.webp" alt="logo" className={styles.logo} /> Login
                </h2>
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
                <button type="submit" className={styles.loginButton}>
                    Login
                </button>
                <div className={styles.linkContainer}>
                    <span className={styles.text}>Don't have an account? </span>
                    <Link href="/signup" className={styles.signupLink}>
                        Sign up here
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;