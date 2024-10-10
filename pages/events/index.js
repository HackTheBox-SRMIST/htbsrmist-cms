import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import withAuth from "@/components/withAuth";

const Events = () => {
    const [currentEvents, setCurrentEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);

    useEffect(() => {
        const cleanDate = (dateStr) => {
            const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
            return cleaned.replace(/(\d+) (\w+) (\d+)/, '$2 $1, $3');
        };

        const fetchEvents = async () => {
            try {
                const response = await axios.get("/api/v1/events");
                let eventsData = response.data.data;

                eventsData = eventsData.map(event => ({
                    ...event,
                    cleaned_date_str: cleanDate(event.event_date),
                    event_date_obj: new Date(cleanDate(event.event_date)),
                }));

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const current = eventsData.filter(event => event.event_date_obj >= today && event.is_active);
                const past = eventsData.filter(event => event.event_date_obj < today);

                current.sort((a, b) => a.event_date_obj - b.event_date_obj);
                past.sort((a, b) => b.event_date_obj - a.event_date_obj);

                setCurrentEvents(current);
                setPastEvents(past);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            

            <h1 className="text-3xl font-bold text-center mb-8">
                Current Events
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.length > 0 ? (
                    currentEvents.map((event) => (
                        <Link href={`/events/${event.slug}`} key={event._id}>
                            <div className="cursor-pointer bg-white shadow-lg rounded-lg overflow-hidden">
                                <img
                                    src={event.poster_url}
                                    alt={event.event_name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-xl font-bold">
                                        {event.event_name}
                                    </h3>
                                    <p className="text-gray-800">
                                        {event.event_time}
                                    </p>
                                    <p className="text-gray-600">
                                        {event.event_date}
                                    </p>
                                    <p className="text-gray-800 mt-2">
                                        {event.venue}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No current events available.</p>
                )}
            </div>


            <h1 className="text-3xl font-bold text-center my-8">
                Past Events
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.length > 0 ? (
                    pastEvents.map((event) => (
                        <Link href={`/events/${event.slug}`} key={event._id}>
                            <div className="cursor-pointer bg-white shadow-lg rounded-lg overflow-hidden">
                                <img
                                    src={event.poster_url}
                                    alt={event.event_name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-xl font-bold">
                                        {event.event_name}
                                    </h3>
                                    <p className="text-gray-800">
                                        {event.event_time}
                                    </p>
                                    <p className="text-gray-600">
                                        {event.event_date}
                                    </p>
                                    <p className="text-gray-800 mt-2">
                                        {event.venue}
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        {event.is_active ? "Active" : "Inactive"}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No past events available.</p>
                )}
            </div>
        </div>
    );
};

export default withAuth(Events);
