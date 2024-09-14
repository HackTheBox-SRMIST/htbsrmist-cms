// pages/events.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "@/components/Events/Card";
import Link from "next/link";
import withAuth from "@/components/withAuth";

const Events = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get("/api/v1/events");
                setEvents(response.data.data);
                console.log("Events data:", response.data);
            } catch (error) {
                console.error("Error fetching events data:", error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-4">Upcoming Events</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                    <Link href={`/events/${event._id}`} key={event._id}>
                        <Card key={event._id} event={event} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default withAuth(Events);
