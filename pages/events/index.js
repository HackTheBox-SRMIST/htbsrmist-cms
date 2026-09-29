import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import {
    useToast,
    useDisclosure,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button,
} from "@chakra-ui/react";
import withAuth from "@/components/withAuth";
import { useTheme } from "@/provider/ThemeProvider";
import { Themes } from "@/utils/misc/themes";
import { ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/shared/Loading";
import Badge from "@/components/shared/Badge";
import AddEventModal from "./AddEventModal";

const Events = () => {
    const [currentEvents, setCurrentEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const toast = useToast();
    const { isDark } = useTheme();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();
    const deleteCancelRef = useRef();
    const [pendingToggleEvent, setPendingToggleEvent] = useState(null);
    const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);

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

    const requestToggle = (event) => {
        setPendingToggleEvent(event);
        onOpen();
    };

    const confirmToggle = () => {
        if (pendingToggleEvent) {
            toggleActive(pendingToggleEvent);
        }
        onClose();
    };

    const showToast = (status, title, description) => {
        const palette = isDark ? Themes.dark : Themes.light;
        const themeBg = {
            success: palette.success.background,
            error: palette.error.background,
            info: palette.info.background,
        };
        const themeText = {
            success: palette.success.color,
            error: palette.error.color,
            info: palette.info.color,
        };
        toast({
            title,
            description,
            status,
            duration: 5000,
            isClosable: true,
            position: "top-right",
            containerStyle: {
                background: themeBg[status],
                color: themeText[status],
                border: `1px solid ${themeText[status]}55`,
            },
        });
    };

    const toggleActive = async (event) => {
        try {
            await axios.patch(`/api/v1/events/${event.slug}`, {
                is_active: !event.is_active,
            });
            const nowActive = !event.is_active;
            showToast(
                nowActive ? "success" : "info",
                nowActive ? "Event Activated" : "Event Inactivated",
                `"${event.event_name}" has been marked ${nowActive ? "active" : "inactive"}.`
            );
            fetchEvents();
        } catch (error) {
            console.error("Error toggling event status:", error);
            showToast(
                "error",
                "Error",
                `Failed to update "${event.event_name}" status.`
            );
        }
    };

    const requestDelete = (event) => {
        setPendingDeleteEvent(event);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (pendingDeleteEvent) {
            deleteEvent(pendingDeleteEvent);
        }
        onDeleteClose();
    };

    const deleteEvent = async (event) => {
        try {
            await axios.delete(`/api/v1/events/${event.slug}`);
            showToast(
                "success",
                "Event Deleted",
                `"${event.event_name}" has been deleted.`
            );
            fetchEvents();
        } catch (error) {
            console.error("Error deleting event:", error);
            showToast(
                "error",
                "Error",
                `Failed to delete "${event.event_name}".`
            );
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
                                <div className="group cursor-pointer bg-light-background-light dark:bg-dark-background-light shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 h-full flex flex-col">
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
                                        <div className="absolute top-4 left-4">
                                            <button
                                                type="button"
                                                title="Edit event"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setEditingEvent(event);
                                                }}
                                                className="bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            title="Delete event"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                requestDelete(event);
                                            }}
                                            className="absolute bottom-4 right-4 bg-red-500/70 hover:bg-red-600 text-white p-2.5 rounded-lg transition-colors z-10"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col gap-4">
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
                                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex gap-2">
                                                <span className="inline-flex items-center justify-center gap-2 flex-1 bg-dark-accent text-black px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:opacity-90">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Manage RSVP
                                                </span>
                                                <button
                                                    type="button"
                                                    title={event.is_active ? "Set event inactive" : "Set event active"}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        requestToggle(event);
                                                    }}
                                                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 ${event.is_active
                                                            ? "bg-red-500 hover:bg-red-600"
                                                            : "bg-green-500 hover:bg-green-600"
                                                        }`}
                                                >
                                                    {event.is_active
                                                            ? <ToggleRight className="w-5 h-5" />
                                                            : <ToggleLeft className="w-5 h-5" />
                                                        }
                                                    {event.is_active ? "Inactivate" : "Activate"}
                                                </button>
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
                                <div className="group cursor-pointer bg-light-background-light dark:bg-dark-side shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 opacity-90 hover:opacity-100 h-full flex flex-col">
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
                                        <div className="absolute top-4 left-4">
                                            <button
                                                type="button"
                                                title="Edit event"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setEditingEvent(event);
                                                }}
                                                className="bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            title="Delete event"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                requestDelete(event);
                                            }}
                                            className="absolute bottom-4 right-4 bg-red-500/70 hover:bg-red-600 text-white p-2.5 rounded-lg transition-colors z-10"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col gap-4">
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
                                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex gap-2">
                                                <span className="inline-flex items-center justify-center gap-2 flex-1 bg-dark-accent text-black px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:opacity-90">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Manage RSVP
                                                </span>
                                                <button
                                                    type="button"
                                                    title={event.is_active ? "Set event inactive" : "Set event active"}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        requestToggle(event);
                                                    }}
                                                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 ${event.is_active
                                                            ? "bg-red-500 hover:bg-red-600"
                                                            : "bg-green-500 hover:bg-green-600"
                                                        }`}
                                                >
                                                    {event.is_active
                                                            ? <ToggleRight className="w-5 h-5" />
                                                            : <ToggleLeft className="w-5 h-5" />
                                                        }
                                                    {event.is_active ? "Inactivate" : "Activate"}
                                                </button>
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

            {(showAddEventModal || editingEvent) && (
                <AddEventModal
                    initialData={editingEvent}
                    onClose={() => {
                        setShowAddEventModal(false);
                        setEditingEvent(null);
                    }}
                    onEventAdded={fetchEvents}
                />
            )}

            {isOpen && pendingToggleEvent && (
                <AlertDialog
                    isOpen={isOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onClose}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                {pendingToggleEvent.is_active
                                    ? "Inactivate Event"
                                    : "Activate Event"}
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                {pendingToggleEvent.is_active
                                    ? `Are you sure you want to make "${pendingToggleEvent.event_name}" inactive?`
                                    : `Are you sure you want to make "${pendingToggleEvent.event_name}" active?`}
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme={pendingToggleEvent.is_active ? "red" : "green"}
                                    onClick={confirmToggle}
                                    ml={3}
                                >
                                    Yes, {pendingToggleEvent.is_active ? "Inactivate" : "Activate"}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            )}

            {isDeleteOpen && pendingDeleteEvent && (
                <AlertDialog
                    isOpen={isDeleteOpen}
                    leastDestructiveRef={deleteCancelRef}
                    onClose={onDeleteClose}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Delete Event
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                Are you sure you really want to delete "{pendingDeleteEvent.event_name}"? This action cannot be undone.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={deleteCancelRef} onClick={onDeleteClose}>
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="red"
                                    onClick={confirmDelete}
                                    ml={3}
                                >
                                    Yes, Delete
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            )}
        </div>
    );
};

export default withAuth(Events);