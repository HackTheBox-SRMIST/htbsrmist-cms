import "@/styles/globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { Themes } from "@/utils/misc/themes";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/shared/Loading";

export default function App({ Component, pageProps }) {
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track session globally

    useEffect(() => {
        const checkSession = () => {
            const user = localStorage.getItem("user");
            const loginTime = localStorage.getItem("loginTime");
            const SESSION_TIMEOUT = 6 * 60 * 60 * 1000; // 6 hours in ms
            const currentTime = new Date().getTime();

            if (user && loginTime) {
                const timeElapsed = currentTime - parseInt(loginTime, 10);
                if (timeElapsed > SESSION_TIMEOUT) {
                    // Session expired
                    localStorage.removeItem("user");
                    localStorage.removeItem("loginTime");
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        checkSession();
        setIsCheckingSession(false); // Stop checking session
    }, []);

    if (isCheckingSession) {
        return <LoadingSpinner />; // Show a loading spinner while checking session
    }

    return (
        <>
            <ThemeProvider>
                <meta
                    name="theme-color"
                    media="(prefers-color-scheme: dark)"
                    content={Themes.dark.background.normal}
                />
                <meta
                    name="theme-color"
                    media="(prefers-color-scheme: light)"
                    content={Themes.light.background.normal}
                />
                <meta
                    name="theme-color"
                    content={Themes.dark.background.normal}
                />
                <ChakraProvider>
                    {/* You can conditionally render the Navbar and Footer based on login status */}
                    {isAuthenticated && <Navbar />}
                    <Component {...pageProps} />
                    {isAuthenticated && <Footer />}
                </ChakraProvider>
            </ThemeProvider>
        </>
    );
}
