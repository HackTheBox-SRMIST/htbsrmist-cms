import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import ButtonLink from "./ButtonLink";

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const [navbarOpen, setNavbarOpen] = useState(false);

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

    const showMenu = () => {
        setNavbarOpen(!navbarOpen);
    };

    return (
        <nav className="flex flex-row justify-between overflow-auto overflow-y-hidden dark:bg-dark-background-normal bg-light-background-dark p-6">
            <div className="container mx-auto flex justify-between items-center">
                <h3 className="lg:text-xl text-2xl dark:text-dark-accent text-light-color  font-bold">
                    HTBCHENNAI
                </h3>
                <ul className="md:flex flex-row flex-nowrap hidden items-center space-x-6 text-light-color dark:text-dark-color">
                    {isLoggedIn ? (
                        <>
                            <li>
                                <ButtonLink href="/events">Events</ButtonLink>
                            </li>
                            <li>
                                <ButtonLink href="/teams">Teams</ButtonLink>
                            </li>
                            <li>
                                <ButtonLink href="/recruitments">
                                    Recruitments
                                </ButtonLink>
                            </li>
                            <li>
                                <ButtonLink onClick={handleLogout}>
                                    Logout
                                </ButtonLink>
                            </li>
                        </>
                    ) : (
                        <li>
                            <ButtonLink href="/">Login</ButtonLink>
                        </li>
                    )}
                    <ThemeToggle />
                </ul>
                    <div className="md:hidden flex items-center absolute right-10">
                        <button
                            className="outline-none mobile-menu-button"
                            onClick={() => showMenu()}
                        >
                            <svg
                                className=" w-6 h-6 text-gray-500 hover:text-green-500 "
                                x-show="!showMenu"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                {navbarOpen && (
                    <div className="z-50">
                        <ul className="text-end text-light-color dark:text-dark-color my-2 mx-auto mt-8 absolute top-10 right-0 dark:bg-dark-background-normal bg-light-background-dark min-w-[100%]">
                            {isLoggedIn ? (
                                <>
                                    <li>
                                        <ButtonLink href="/events">
                                            Events
                                        </ButtonLink>
                                    </li>
                                    <li>
                                        <ButtonLink href="/teams">
                                            Teams
                                        </ButtonLink>
                                    </li>
                                    <li>
                                        <ButtonLink href="/recruitments">
                                            Recruitments
                                        </ButtonLink>
                                    </li>
                                    <li>
                                        <ButtonLink onClick={handleLogout}>
                                            Logout
                                        </ButtonLink>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <ButtonLink href="/">Login</ButtonLink>
                                </li>
                            )}
                            <ThemeToggle />
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
