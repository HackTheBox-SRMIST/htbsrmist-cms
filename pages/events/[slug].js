import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const EventDetail = () => {
    const router = useRouter();
    const { id } = router.query;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchEvent = async () => {
                try {
                    const response = await axios.get(`/api/v1/events/${id}`);
                    setEvent(response.data);
                    console.log("Event data:", response.data);
                    setLoading(false);
                } catch (error) {
                    console.log("Error fetching event data:", error);
                    setError("Error fetching event data.");
                    setLoading(false);
                }
            };

            fetchEvent();
        }
    }, []);

    return (
        <div className="border p-4 rounded shadow-lg">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {event && (
                <>
                    {event.poster_url && (
                        <img
                            src={event.poster_url}
                            alt={`${event.event_name} poster`}
                            className="mb-4 w-full h-48 object-cover"
                        />
                    )}
                    <h2 className="text-2xl font-semibold">
                        {event.event_name}
                    </h2>
                    <p className="text-gray-600">{event.event_description}</p>
                    <p>
                        <strong>Date:</strong>{" "}
                        {new Date(event.event_date).toLocaleDateString()}
                    </p>
                    <p>
                        <strong>Venue:</strong> {event.venue}
                    </p>
                    <p>
                        <strong>Duration:</strong> {event.duration} hours
                    </p>
                    <p>
                        <strong>Cost:</strong> ${event.cost}
                    </p>
                    <a href={event.registration_url} className="text-blue-500">
                        Register here
                    </a>
                </>
            )}
        </div>
    );
};

export default EventDetail;
