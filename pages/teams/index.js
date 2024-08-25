import React from "react";
import Card from "@/components/Teams/Card";

const TeamPage = () => {
    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-4">Team Page</h1>
            <p className="text-lg">This is a sample team page.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
            </div>
        </div>
    );
};

export default TeamPage;
