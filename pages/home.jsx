import React from "react";
import Sidebar from "@/components/shared/sidebar";
import styles from "@/styles/Home.module.css";

export default function Home() {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.homeContainer}>
                <h1 className={styles.homeTitle}>Welcome to the Home Page</h1>
                <p className={styles.homeText}>You have successfully logged in or signed up.</p>
            </main>
        </div>
    );
}
