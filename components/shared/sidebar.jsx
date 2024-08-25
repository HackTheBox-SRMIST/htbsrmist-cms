import React from "react";
import Link from "next/link";
import styles from "@/styles/Sidebar.module.css";

export default function Sidebar() {
    return (
        <div className={styles.sidebar}>
            <Link href="/event" className={styles.link}>Events</Link>
            <Link href="/team" className={styles.link}>Teams</Link>
        </div>
    );
}
