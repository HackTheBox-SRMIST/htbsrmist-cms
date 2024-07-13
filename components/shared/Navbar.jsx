import React from "react";

const Navbar = () => {
    return (
        <nav className="bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <button className=" text-white px-4 py-2 text-xl font-medium">
                        HTBSRMIST
                    </button>
                    <div>
                        <button className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
