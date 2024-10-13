import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import ButtonLink from "./ButtonLink";

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            setIsLoggedIn(true);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        router.push("/");
    };

    return (
        <nav className="dark:bg-dark-background-normal bg-light-background-dark p-6">
            <div className="container mx-auto flex justify-between items-center">
                <h3 className="lg:text-xl text-2xl dark:text-dark-accent text-light-color  font-bold">HTBSRMIST</h3>
                <ul className="flex items-center space-x-6 text-light-color dark:text-dark-color">
                    {isLoggedIn ? (
                        <>
                            <li>
                                <ButtonLink
                                    href="/events"
                                >
                                    Events
                                </ButtonLink>
                            </li>
                            <li>
                                <ButtonLink
                                    href="/teams"
                                >
                                    Teams
                                </ButtonLink>
                            </li>
                            <li>
                                <ButtonLink
                                    href="/recruitments"
                                >
                                    Recruitments
                                </ButtonLink>
                            </li>
                            <li>
                                <ButtonLink
                                    onClick={handleLogout}
                                >
                                    Logout
                                </ButtonLink>
                            </li>
                        </>
                    ) : (
                        <li>
                            <ButtonLink
                                href="/"
                            >
                                Login
                            </ButtonLink>
                        </li>
                    )}
                    <ThemeToggle/>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
