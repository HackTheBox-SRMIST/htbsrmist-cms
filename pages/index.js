import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const SESSION_TIMEOUT = 6 * 60 * 60 * 1000;

    useEffect(() => {
        const user = localStorage.getItem("user");
        const loginTime = localStorage.getItem("loginTime");

        if (user && loginTime) {
            const currentTime = new Date().getTime();
            const timeElapsed = currentTime - parseInt(loginTime, 10);

            if (timeElapsed > SESSION_TIMEOUT) {
                localStorage.removeItem("user");
                localStorage.removeItem("loginTime");
                router.push("/");
            } else {
                setIsLoggedIn(true);
            }
        }
    }, [router]);

    const handleLogin = (e) => {
        e.preventDefault();

        const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
        const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        const managerUsername = process.env.NEXT_PUBLIC_MANAGER_USERNAME;
        const managerPassword = process.env.NEXT_PUBLIC_MANAGER_PASSWORD;

        if (
            (username === adminUsername && password === adminPassword) ||
            (username === managerUsername && password === managerPassword)
        ) {
            const currentTime = new Date().getTime();
            localStorage.setItem("user", username);
            localStorage.setItem("loginTime", currentTime.toString());
            setIsLoggedIn(true);
        } else {
            setError("Invalid username or password");
        }
    };

    const handleRedirect = (path) => {
        router.push(path);
    };

    return (
        <div className="flex items-center justify-center h-screen dark:bg-dark-background-normal bg-light-background-normal">
            <div className="w-full max-w-md bg-light-background-dark dark:bg-dark-background-darker  shadow-lg rounded-lg p-8">
                {!isLoggedIn ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                        <h1 className="lg:text-xl text-2xl dark:text-dark-color text-light-color  font-bold text-center mb-6">Login</h1>
                            <label className="block text-sm font-medium dark:text-dark-accent text-light-color pb-2">
                                Username:
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-2xl rounded-tl-[6px] rounded-tr-[6px] bg-light-background-normal dark:bg-dark-input px-6 py-3 font-sans font-medium text-light-color dark:text-dark-color dark:focus:outline-dark-accent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-dark-accent text-light-color pb-2">
                                Password:
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-2xl rounded-tl-[6px] rounded-tr-[6px] bg-light-background-normal dark:bg-dark-input px-6 py-3 font-sans font-medium text-light-color dark:text-dark-color"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <button
                            type="submit"
                            className="w-full dark:bg-dark-background-normal bg-light-background-darker text-light-color font-semibold text-xl dark:text-dark-accent py-2 px-4 rounded-lg dark:hover:text-light-accent transition duration-300"
                        >
                            Login
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-4 bg-light-background-dark dark:bg-dark-background-darker">
                        <button
                            onClick={() => handleRedirect("/teams")}
                            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg"
                        >
                            Go to Teams
                        </button>
                        <button
                            onClick={() => handleRedirect("/events")}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded-lg"
                        >
                            Go to Events
                        </button>
                        <button
                            onClick={() => handleRedirect("/recruitments")}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded-lg"
                        >
                            Go to Recruitments
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
