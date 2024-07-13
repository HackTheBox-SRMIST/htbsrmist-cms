// components/Events/Card.js
import React from "react";

const Card = ({ event }) => {
    return (
        <div className="border p-4 rounded shadow-lg">
            <img
                src={event.poster_url}
                alt={`${event.event_name} poster`}
                className="mb-4 w-full h-48 object-cover"
            />
            <h2 className="text-2xl font-semibold">{event.event_name}</h2>
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
        </div>
    );
};

export default Card;
