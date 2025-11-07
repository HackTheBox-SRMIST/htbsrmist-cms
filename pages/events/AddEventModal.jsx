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
        cost: 0,
        database: "",
        prerequisites: [],
        speakers_details: [],
        sponsors_details: [],
        gallery: [],
        collection: {
            organizers: "organizers",
            volunteers: "volunteers",
            participants: "participants",
        },
        certificate: {
            organizers: "",
            volunteers: "",
            participants: "",
            first_place: "",
            second_place: "",
            third_place: "",
        },
        jimp_config: {
            yOffset: "-70",
            color: "white",
            font_size: "64",
        },
    });

    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("basic");

    const [prerequisiteInput, setPrerequisiteInput] = useState("");
    const [speakerInput, setSpeakerInput] = useState({
        name: "",
        designation: "",
        details: "",
    });
    const [sponsorInput, setSponsorInput] = useState({
        name: "",
        details: "",
        place: "",
    });
    const [galleryInput, setGalleryInput] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData({
            ...formData,
            [parent]: {
                ...formData[parent],
                [field]: value,
            },
        });
    };

    const handleArrayInput = (setter) => (e) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: value }));
    };

    // ----- Array Handlers -----
    const addPrerequisite = () => {
        if (prerequisiteInput.trim()) {
            setFormData({
                ...formData,
                prerequisites: [...formData.prerequisites, prerequisiteInput.trim()],
            });
            setPrerequisiteInput("");
        }
    };

    const removePrerequisite = (index) => {
        setFormData({
            ...formData,
            prerequisites: formData.prerequisites.filter((_, i) => i !== index),
        });
    };

    const addSpeaker = () => {
        if (speakerInput.name.trim()) {
            setFormData({
                ...formData,
                speakers_details: [...formData.speakers_details, { ...speakerInput }],
            });
            setSpeakerInput({ name: "", designation: "", details: "" });
        }
    };

    const removeSpeaker = (index) => {
        setFormData({
            ...formData,
            speakers_details: formData.speakers_details.filter((_, i) => i !== index),
        });
    };

    const addSponsor = () => {
        if (sponsorInput.name.trim()) {
            setFormData({
                ...formData,
                sponsors_details: [...formData.sponsors_details, { ...sponsorInput }],
            });
            setSponsorInput({ name: "", details: "", place: "" });
        }
    };

    const removeSponsor = (index) => {
        setFormData({
            ...formData,
            sponsors_details: formData.sponsors_details.filter((_, i) => i !== index),
        });
    };

    const addGalleryImage = () => {
        if (galleryInput.trim()) {
            setFormData({
                ...formData,
                gallery: [...formData.gallery, galleryInput.trim()],
            });
            setGalleryInput("");
        }
    };

    const removeGalleryImage = (index) => {
        setFormData({
            ...formData,
            gallery: formData.gallery.filter((_, i) => i !== index),
        });
    };

    // ----- Submit -----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

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

        if (formData.teamEvent && !formData.teamSize) {
            setError("Team size is required for team events");
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

    const tabs = [
        { id: "basic", label: "Basic Info" },
        { id: "people", label: "People" },
        { id: "media", label: "Media & Gallery" },
        { id: "certificates", label: "Certificates" },
        { id: "config", label: "Configuration" },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-light-background-light dark:bg-dark-background-light shadow-2xl rounded-xl w-[95%] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-center dark:text-dark-accent text-light-color">
                        Add New Event
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-lg font-semibold"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-4 dark:bg-dark-error-background bg-light-error-background py-3 px-4 rounded-lg">
                        <p className="dark:text-dark-error-color text-light-error-color text-sm text-center">
                            {error}
                        </p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-gray-300 dark:border-gray-700 px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? "border-b-2 border-dark-accent text-dark-accent dark:text-dark-accent"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {/* BASIC TAB */}
                    {activeTab === "basic" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                                    Event Name *
                                </label>
                                <input
                                    name="event_name"
                                    placeholder="Enter event name"
                                    onChange={handleChange}
                                    value={formData.event_name}
                                    className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                                    Slug *
                                </label>
                                <input
                                    name="slug"
                                    placeholder="event-name-slug"
                                    onChange={handleChange}
                                    value={formData.slug}
                                    className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
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
                                    onChange={handleChange}
                                    value={formData.event_description}
                                    className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg resize-none"
                                />
                            </div>

                            {/* Grid fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    name="event_date"
                                    type="text"
                                    placeholder="Date (e.g. 10th Oct 2025)"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                                <input
                                    name="event_time"
                                    type="text"
                                    placeholder="Time (e.g. 9 AM - 5 PM)"
                                    value={formData.event_time}
                                    onChange={handleChange}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                            </div>

                            <input
                                name="venue"
                                placeholder="Event Venue"
                                onChange={handleChange}
                                value={formData.venue}
                                className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    name="duration"
                                    type="number"
                                    placeholder="Duration in days"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                                <input
                                    name="cost"
                                    type="number"
                                    placeholder="Cost (0 for free)"
                                    value={formData.cost}
                                    onChange={handleChange}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="teamEvent"
                                    checked={formData.teamEvent}
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />
                                <label className="text-sm font-medium dark:text-dark-color text-light-color">
                                    Team Event
                                </label>
                            </div>

                            {formData.teamEvent && (
                                <input
                                    name="teamSize"
                                    type="number"
                                    placeholder="Team Size"
                                    value={formData.teamSize}
                                    onChange={handleChange}
                                    className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                            )}

                            <input
                                name="poster_url"
                                placeholder="Poster URL"
                                value={formData.poster_url}
                                onChange={handleChange}
                                className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                            />

                            <input
                                name="registration_url"
                                placeholder="Registration Form URL"
                                value={formData.registration_url}
                                onChange={handleChange}
                                className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                            />

                            {/* Prerequisites */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 dark:text-dark-color text-light-color">
                                    Prerequisites
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Add prerequisite"
                                        value={prerequisiteInput}
                                        onChange={(e) => setPrerequisiteInput(e.target.value)}
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && (e.preventDefault(), addPrerequisite())
                                        }
                                        className="flex-1 bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={addPrerequisite}
                                        className="bg-dark-accent text-white px-4 py-2.5 rounded-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.prerequisites.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.prerequisites.map((p, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between bg-light-background-darker dark:bg-dark-background-darker px-3 py-2 rounded-lg"
                                            >
                                                <span>{p}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removePrerequisite(i)}
                                                    className="text-red-500"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PEOPLE TAB */}
                    {activeTab === "people" && (
                        <div className="space-y-6">
                            {/* Speakers Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 dark:text-dark-color text-light-color">
                                    Speakers
                                </h3>
                                <div className="space-y-3 mb-4">
                                    <input
                                        name="name"
                                        placeholder="Speaker Name"
                                        value={speakerInput.name}
                                        onChange={handleArrayInput(setSpeakerInput)}
                                        className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <input
                                        name="designation"
                                        placeholder="Designation"
                                        value={speakerInput.designation}
                                        onChange={handleArrayInput(setSpeakerInput)}
                                        className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <textarea
                                        name="details"
                                        placeholder="Speaker Details"
                                        value={speakerInput.details}
                                        onChange={handleArrayInput(setSpeakerInput)}
                                        rows="2"
                                        className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg resize-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSpeaker}
                                        className="bg-dark-accent text-white px-4 py-2.5 rounded-lg"
                                    >
                                        Add Speaker
                                    </button>
                                </div>
                                {formData.speakers_details.length > 0 && (
                                    <div className="space-y-3">
                                        {formData.speakers_details.map((speaker, i) => (
                                            <div
                                                key={i}
                                                className="bg-light-background-darker dark:bg-dark-background-darker p-3 rounded-lg border"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold">{speaker.name}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {speaker.designation}
                                                        </p>
                                                        <p className="text-sm mt-1">{speaker.details}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSpeaker(i)}
                                                        className="text-red-500 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sponsors Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 dark:text-dark-color text-light-color">
                                    Sponsors
                                </h3>
                                <div className="space-y-3 mb-4">
                                    <input
                                        name="name"
                                        placeholder="Sponsor Name"
                                        value={sponsorInput.name}
                                        onChange={handleArrayInput(setSponsorInput)}
                                        className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <input
                                        name="place"
                                        placeholder="Sponsor Place/Level"
                                        value={sponsorInput.place}
                                        onChange={handleArrayInput(setSponsorInput)}
                                        className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <textarea
                                        name="details"
                                        placeholder="Sponsor Details"
                                        value={sponsorInput.details}
                                        onChange={handleArrayInput(setSponsorInput)}
                                        rows="2"
                                        className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg resize-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSponsor}
                                        className="bg-dark-accent text-white px-4 py-2.5 rounded-lg"
                                    >
                                        Add Sponsor
                                    </button>
                                </div>
                                {formData.sponsors_details.length > 0 && (
                                    <div className="space-y-3">
                                        {formData.sponsors_details.map((sponsor, i) => (
                                            <div
                                                key={i}
                                                className="bg-light-background-darker dark:bg-dark-background-darker p-3 rounded-lg border"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold">{sponsor.name}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {sponsor.place}
                                                        </p>
                                                        <p className="text-sm mt-1">{sponsor.details}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSponsor(i)}
                                                        className="text-red-500 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MEDIA TAB */}
                    {activeTab === "media" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3 dark:text-dark-color text-light-color">
                                    Gallery Images
                                </h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={galleryInput}
                                        onChange={(e) => setGalleryInput(e.target.value)}
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && (e.preventDefault(), addGalleryImage())
                                        }
                                        className="flex-1 bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={addGalleryImage}
                                        className="bg-dark-accent text-white px-4 py-2.5 rounded-lg"
                                    >
                                        Add Image
                                    </button>
                                </div>
                                {formData.gallery.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {formData.gallery.map((url, i) => (
                                            <div
                                                key={i}
                                                className="bg-light-background-darker dark:bg-dark-background-darker p-3 rounded-lg border flex justify-between items-center"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                                        <span className="text-xs">IMG</span>
                                                    </div>
                                                    <span className="text-sm truncate flex-1">{url}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(i)}
                                                    className="text-red-500 text-sm ml-2"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CERTIFICATES TAB */}
                    {activeTab === "certificates" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-3 dark:text-dark-color text-light-color">
                                Certificate Templates
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    placeholder="Organizers Certificate URL"
                                    value={formData.certificate.organizers}
                                    onChange={(e) => handleNestedChange("certificate", "organizers", e.target.value)}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                                <input
                                    placeholder="Volunteers Certificate URL"
                                    value={formData.certificate.volunteers}
                                    onChange={(e) => handleNestedChange("certificate", "volunteers", e.target.value)}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                                <input
                                    placeholder="Participants Certificate URL"
                                    value={formData.certificate.participants}
                                    onChange={(e) => handleNestedChange("certificate", "participants", e.target.value)}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                                <input
                                    placeholder="First Place Certificate URL"
                                    value={formData.certificate.first_place}
                                    onChange={(e) => handleNestedChange("certificate", "first_place", e.target.value)}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                                <input
                                    placeholder="Second Place Certificate URL"
                                    value={formData.certificate.second_place}
                                    onChange={(e) => handleNestedChange("certificate", "second_place", e.target.value)}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                                <input
                                    placeholder="Third Place Certificate URL"
                                    value={formData.certificate.third_place}
                                    onChange={(e) => handleNestedChange("certificate", "third_place", e.target.value)}
                                    className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    {/* CONFIG TAB */}
                    {activeTab === "config" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3 dark:text-dark-color text-light-color">
                                    Database Configuration
                                </h3>
                                <input
                                    name="database"
                                    placeholder="Database Name"
                                    value={formData.database}
                                    onChange={handleChange}
                                    className="w-full bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <input
                                        placeholder="Organizers Collection"
                                        value={formData.collection.organizers}
                                        onChange={(e) => handleNestedChange("collection", "organizers", e.target.value)}
                                        className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <input
                                        placeholder="Volunteers Collection"
                                        value={formData.collection.volunteers}
                                        onChange={(e) => handleNestedChange("collection", "volunteers", e.target.value)}
                                        className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <input
                                        placeholder="Participants Collection"
                                        value={formData.collection.participants}
                                        onChange={(e) => handleNestedChange("collection", "participants", e.target.value)}
                                        className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3 dark:text-dark-color text-light-color">
                                    JIMP Configuration (Certificate Text)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Y Offset"
                                        value={formData.jimp_config.yOffset}
                                        onChange={(e) => handleNestedChange("jimp_config", "yOffset", e.target.value)}
                                        className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <input
                                        placeholder="Text Color"
                                        value={formData.jimp_config.color}
                                        onChange={(e) => handleNestedChange("jimp_config", "color", e.target.value)}
                                        className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Font Size"
                                        value={formData.jimp_config.font_size}
                                        onChange={(e) => handleNestedChange("jimp_config", "font_size", e.target.value)}
                                        className="bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />
                                <label className="text-sm font-medium dark:text-dark-color text-light-color">
                                    Event is Active
                                </label>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-300 dark:border-gray-700 p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-5 py-2.5 rounded-lg bg-dark-accent text-white font-medium hover:opacity-90"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEventModal;