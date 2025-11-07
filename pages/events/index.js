import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import withAuth from "@/components/withAuth";
import LoadingSpinner from "@/components/shared/Loading";
import Badge from "@/components/shared/Badge";
import AddEventModal from "./AddEventModal";

const Events = () => {
    const [currentEvents, setCurrentEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddEventModal, setShowAddEventModal] = useState(false);

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
                event_date_obj: new Date(cleanDate(event.event_date)),
            }));

            const current = eventsData.filter(
                (event) => event.is_active
            );
            const past = eventsData.filter(
                (event) => !event.is_active
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

    useEffect(() => {
        fetchEvents();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-light-background-darker dark:bg-dark-background-darker px-4 sm:px-6 lg:px-8 py-10">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold dark:text-dark-accent text-light-color mb-2">
                            Current Events
                        </h1>
                        <p className="text-sm dark:text-dark-color text-light-color opacity-75">
                            Discover upcoming events and activities
                        </p>
                    </div>
                    <button
                        className="bg-light-background-light dark:bg-dark-background-light hover:bg-light-background-darker dark:hover:bg-dark-side shadow-lg text-light-color dark:text-dark-accent px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-xl hover:scale-105"
                        onClick={() => setShowAddEventModal(true)}
                    >
                        + Add New Event
                    </button>
                </div>
            </div>

            {/* Current Events Grid */}
            <div className="max-w-7xl mx-auto mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentEvents.length > 0 ? (
                        currentEvents.map((event) => (
                            <Link href={`/events/${event.slug}`} key={event._id}>
                                <div className="group cursor-pointer bg-light-background-light dark:bg-dark-background-light shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2">
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={event.poster_url}
                                            alt={event.event_name}
                                            className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <Badge
                                                status={event.is_active ? "Active" : "Inactive"}
                                                variant={event.is_active ? "success" : "error"}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl dark:text-dark-color text-light-color font-bold mb-3 line-clamp-2">
                                            {event.event_name}
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 dark:text-dark-accent text-light-color opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="dark:text-dark-color text-light-color text-sm">
                                                    {event.event_time}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 dark:text-dark-accent text-light-color opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="dark:text-dark-color text-light-color text-sm">
                                                    {event.event_date}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 dark:text-dark-accent text-light-color opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="dark:text-dark-color text-light-color text-sm">
                                                    {event.venue}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full flex justify-center items-center py-20">
                            <div className="dark:bg-dark-error-background bg-light-error-background py-8 px-12 rounded-2xl shadow-lg">
                                <p className="dark:text-dark-error-color text-light-error-color text-center text-lg font-medium">
                                    No current events available
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Past Events Section */}
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold dark:text-dark-accent text-light-color mb-2">
                        Past Events
                    </h1>
                    <p className="text-sm dark:text-dark-color text-light-color opacity-75">
                        Explore our previous events and activities
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pastEvents.length > 0 ? (
                        pastEvents.map((event) => (
                            <Link href={`/events/${event.slug}`} key={event._id}>
                                <div className="group cursor-pointer bg-light-background-light dark:bg-dark-side shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 opacity-90 hover:opacity-100">
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={event.poster_url}
                                            alt={event.event_name}
                                            className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <Badge
                                                status={event.is_active ? "Active" : "Inactive"}
                                                variant={event.is_active ? "success" : "error"}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl dark:text-dark-color text-light-color font-bold mb-3 line-clamp-2">
                                            {event.event_name}
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 dark:text-dark-accent text-light-color opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="dark:text-dark-color text-light-color text-sm">
                                                    {event.event_time}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 dark:text-dark-accent text-light-color opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="dark:text-dark-color text-light-color text-sm">
                                                    {event.event_date}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 dark:text-dark-accent text-light-color opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="dark:text-dark-color text-light-color text-sm">
                                                    {event.venue}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full flex justify-center items-center py-20">
                            <div className="dark:bg-dark-error-background bg-light-error-background py-8 px-12 rounded-2xl shadow-lg">
                                <p className="dark:text-dark-error-color text-light-error-color text-center text-lg font-medium">
                                    No past events available
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAddEventModal && (
                <AddEventModal
                    onClose={() => setShowAddEventModal(false)}
                    onEventAdded={fetchEvents}
                />
            )}
        </div>
    );
};

export default withAuth(Events);