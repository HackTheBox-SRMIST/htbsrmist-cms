import { useState } from "react";
import axios from "axios";

const AddEventModal = ({ onClose, onEventAdded }) => {
    const [formData, setFormData] = useState({
        event_name: "",
        slug: "",
        event_description: "",
        event_date: "",
        event_time: "",
        venue: "",
        is_active: true,
        poster_url: "",
        registration_url: "",
        duration: "",
        teamEvent: false,
        teamSize: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // 🧩 Validate required fields
        const requiredFields = [
            "event_name",
            "slug",
            "event_description",
            "event_date",
            "event_time",
            "venue",
            "poster_url",
            "registration_url",
            "duration",
            "teamEvent",
            "teamSize",
        ];

        const missing = requiredFields.filter(
            (field) =>
                formData[field] === undefined ||
                formData[field] === null ||
                formData[field] === ""
        );

        if (missing.length > 0) {
            setError(`Missing required fields: ${missing.join(", ")}`);
            return;
        }

        try {
            await axios.post("/api/v1/events", formData);
            onEventAdded();
            onClose();
        } catch (error) {
            console.error("Error adding event:", error);
            setError("Error adding event. Check console for details.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-light-background-light dark:bg-dark-background-light shadow-2xl p-8 rounded-xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center dark:text-dark-accent text-light-color">
                    Add New Event
                </h2>

                {error && (
                    <div className="dark:bg-dark-error-background bg-light-error-background py-3 px-4 rounded-lg mb-4">
                        <p className="dark:text-dark-error-color text-light-error-color text-sm text-center">
                            {error}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                            Event Name *
                        </label>
                        <input
                            name="event_name"
                            placeholder="Enter event name"
                            className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent"
                            onChange={handleChange}
                            value={formData.event_name}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                            Slug (unique identifier) *
                        </label>
                        <input
                            name="slug"
                            placeholder="event-name-slug"
                            className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent"
                            onChange={handleChange}
                            value={formData.slug}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                            Event Description *
                        </label>
                        <textarea
                            name="event_description"
                            placeholder="Describe your event"
                            rows="3"
                            className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent resize-none"
                            onChange={handleChange}
                            value={formData.event_description}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                                Event Date *
                            </label>
                            <input
                                name="event_date"
                                type="text"
                                placeholder="e.g. 9th Oct 2025"
                                className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent"
                                onChange={handleChange}
                                value={formData.event_date}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                                Event Time *
                            </label>
                            <input
                                name="event_time"
                                type="text"
                                placeholder="e.g. 9:00 AM to 5:00 PM"
                                className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent"
                                onChange={handleChange}
                                value={formData.event_time}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                            Venue *
                        </label>
                        <input
                            name="venue"
                            placeholder="Event location"
                            className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent"
                            onChange={handleChange}
                            value={formData.venue}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                            Poster URL *
                        </label>
                        <input
                            name="poster_url"
                            placeholder="https://example.com/poster.jpg"
                            className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent"
                            onChange={handleChange}
                            value={formData.poster_url}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                            Registration Form URL *
                        </label>
                        <input
                            name="registration_url"
                            placeholder="https://forms.example.com/register"
                            className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent"
                            onChange={handleChange}
                            value={formData.registration_url}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                            Duration (days) *
                        </label>
                        <input
                            name="duration"
                            type="number"
                            placeholder="e.g. 1, 2, 3"
                            className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent"
                            onChange={handleChange}
                            value={formData.duration}
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-dark-accent focus:ring-2 focus:ring-dark-accent cursor-pointer"
                            />
                            <span className="text-sm font-medium dark:text-dark-color text-light-color">
                                Active Event
                            </span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="teamEvent"
                                checked={formData.teamEvent}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-dark-accent focus:ring-2 focus:ring-dark-accent cursor-pointer"
                            />
                            <span className="text-sm font-medium dark:text-dark-color text-light-color">
                                Team Event
                            </span>
                        </label>
                    </div>

                    {formData.teamEvent && (
                        <div>
                            <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                                Team Size *
                            </label>
                            <input
                                name="teamSize"
                                type="number"
                                placeholder="e.g. 4"
                                className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg dark:text-dark-color text-light-color placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent dark:focus:ring-dark-accent"
                                onChange={handleChange}
                                value={formData.teamSize}
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            className="bg-light-background-darker dark:bg-dark-background-darker hover:bg-gray-300 dark:hover:bg-dark-side shadow-md text-light-color dark:text-dark-color px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-light-background-light dark:bg-dark-background-light hover:bg-light-background-darker dark:hover:bg-dark-side shadow-lg text-light-color dark:text-dark-accent px-6 py-2.5 rounded-lg font-semibold transition-all duration-200"
                        >
                            Add Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;