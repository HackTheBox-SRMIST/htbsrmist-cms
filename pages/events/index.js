import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import withAuth from "@/components/withAuth";
import LoadingSpinner from "@/components/shared/Loading";
import Badge from "@/components/shared/Badge";

const Events = () => {
    const [currentEvents, setCurrentEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cleanDate = (dateStr) => {
            const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
            return cleaned.replace(/(\d+) (\w+) (\d+)/, "$2 $1, $3");
        };

        const fetchEvents = async () => {
            try {
                const response = await axios.get("/api/v1/events");
                let eventsData = response.data.data;

                eventsData = eventsData.map((event) => ({
                    ...event,
                    cleaned_date_str: cleanDate(event.event_date),
                    event_date_obj: new Date(cleanDate(event.event_date))
                }));

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const current = eventsData.filter(
                    (event) => event.event_date_obj >= today && event.is_active
                );
                const past = eventsData.filter(
                    (event) => event.event_date_obj < today
                );

                current.sort((a, b) => a.event_date_obj - b.event_date_obj);
                past.sort((a, b) => b.event_date_obj - a.event_date_obj);

                setCurrentEvents(current);
                setPastEvents(past);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-light-background-darker dark:bg-dark-background-darker px-4 py-8 ">
            <h1 className="text-3xl font-bold text-center mb-8 dark:text-dark-accent text-light-color">
                Current Events
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.length > 0 ? (
                    currentEvents.map((event) => (
                        <Link href={`/events/${event.slug}`} key={event._id}>
                            <div className="cursor-pointer bg-light-background-light dark:bg-dark-background-light shadow-lg rounded-lg overflow-hidden">
                                <img
                                    src={event.poster_url}
                                    alt={event.event_name}
                                    className="h-80 w-full object-cover"
                                />
                                <div className="p-4 flex flex-row justify-between">
                                    <div>
                                        <h3 className="text-xl dark:text-dark-color text-light-color font-bold">
                                            {event.event_name}
                                        </h3>
                                        <p className="dark:text-dark-color text-light-color mt-2">
                                            {event.event_time}
                                        </p>
                                        <p className="dark:text-dark-color text-light-color">
                                            {event.event_date}
                                        </p>
                                        <p className="dark:text-dark-color text-light-color">
                                            {event.venue}
                                        </p>
                                    </div>
                                    <div>
                                        <Badge
                                            status={
                                                event.is_active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            variant={
                                                event.is_active
                                                    ? "success"
                                                    : "error"
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="flex justify-center items-center col-span-full">
                        <div className="dark:bg-dark-error-background bg-light-error-background py-6 px-10 rounded-xl">
                            <p className="dark:text-dark-error-color text-light-error-color text-center">
                                No current events available
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <h1 className="text-3xl font-bold text-center my-8 dark:text-dark-accent text-light-color">
                Past Events
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.length > 0 ? (
                    pastEvents.map((event) => (
                        <Link href={`/events/${event.slug}`} key={event._id}>
                            <div className="cursor-pointer bg-light-background-light dark:bg-dark-side shadow-lg rounded-lg overflow-hidden">
                                <img
                                    src={event.poster_url}
                                    alt={event.event_name}
                                    className="h-80 w-full object-cover"
                                />
                                <div className="p-4 flex flex-row justify-between">
                                    <div>
                                        <h3 className="text-xl dark:text-dark-color text-light-color font-bold">
                                            {event.event_name}
                                        </h3>
                                        <p className="dark:text-dark-color text-light-color mt-2">
                                            {event.event_time}
                                        </p>
                                        <p className="dark:text-dark-color text-light-color">
                                            {event.event_date}
                                        </p>
                                        <p className="dark:text-dark-color text-light-color">
                                            {event.venue}
                                        </p>
                                    </div>
                                    <div>
                                        <Badge
                                            status={
                                                event.is_active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            variant={
                                                event.is_active
                                                    ? "success"
                                                    : "error"
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="flex justify-center items-center col-span-full">
                        <div className="dark:bg-dark-error-background bg-light-error-background py-6 px-10 rounded-xl">
                            <p className="dark:text-dark-error-color text-light-error-color text-center">
                                No Past events available
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default withAuth(Events);
