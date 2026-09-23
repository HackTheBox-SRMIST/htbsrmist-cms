import { useState } from "react";
import axios from "axios";

const AddEventModal = ({ onClose, onEventAdded, initialData = null }) => {
    const isEdit = Boolean(initialData);

    const defaults = {
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
    };

    const buildFormData = (data) => {
        if (!data) return { ...defaults };

        const base = { ...defaults };
        Object.keys(defaults).forEach((key) => {
            if (data[key] !== undefined && data[key] !== null) {
                if (Array.isArray(defaults[key])) {
                    base[key] = [...data[key]];
                } else if (typeof defaults[key] === "object") {
                    base[key] = { ...defaults[key], ...data[key] };
                } else {
                    base[key] = data[key];
                }
            }
        });
        return base;
    };

    const [formData, setFormData] = useState(() => buildFormData(initialData));

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
    const [editingGalleryIndex, setEditingGalleryIndex] = useState(null);

    const inputCls =
        "w-full bg-light-background-dark dark:bg-dark-background-dark border border-gray-300 dark:border-gray-700 px-4 py-2.5 rounded-lg text-light-color dark:text-dark-color placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-accent";
    const labelCls =
        "block text-sm font-medium mb-1.5 text-light-color dark:text-dark-color";
    const sectionCls =
        "text-lg font-semibold mb-4 text-light-color dark:text-dark-color";
    const accentBtnCls =
        "inline-flex items-center justify-center gap-2 bg-dark-accent text-black px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.02]";

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
            if (editingGalleryIndex !== null) {
                const updatedGallery = [...formData.gallery];
                updatedGallery[editingGalleryIndex] = galleryInput.trim();
                setFormData({
                    ...formData,
                    gallery: updatedGallery,
                });
                setEditingGalleryIndex(null);
            } else {
                setFormData({
                    ...formData,
                    gallery: [...formData.gallery, galleryInput.trim()],
                });
            }
            setGalleryInput("");
        }
    };

    const editGalleryImage = (index) => {
        setGalleryInput(formData.gallery[index]);
        setEditingGalleryIndex(index);
    };

    const cancelGalleryEdit = () => {
        setEditingGalleryIndex(null);
        setGalleryInput("");
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
            if (isEdit) {
                await axios.patch(`/api/v1/events/${initialData.slug}`, formData);
            } else {
                await axios.post("/api/v1/events", formData);
            }
            onEventAdded();
            onClose();
        } catch (error) {
            console.error("Error saving event:", error);
            setError(`Error ${isEdit ? "updating" : "adding"} event. Check console for details.`);
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
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-light-background-light dark:bg-dark-background-light shadow-2xl rounded-2xl w-[95%] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-light-color dark:text-dark-accent">
                        {isEdit ? "Edit Event" : "Add New Event"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-lg font-semibold transition-colors"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-4 dark:bg-dark-error-background bg-light-error-background py-3 px-4 rounded-lg border border-red-300 dark:border-red-900">
                        <p className="dark:text-dark-error-color text-light-error-color text-sm text-center">
                            {error}
                        </p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.id
                                    ? "bg-dark-accent text-black"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
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
                        <div className="space-y-5">
                            <div>
                                <label className={labelCls}>Event Name *</label>
                                <input
                                    name="event_name"
                                    placeholder="Enter event name"
                                    onChange={handleChange}
                                    value={formData.event_name}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Slug *</label>
                                <input
                                    name="slug"
                                    placeholder="event-name-slug"
                                    onChange={handleChange}
                                    value={formData.slug}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Event Description *</label>
                                <textarea
                                    name="event_description"
                                    placeholder="Describe your event"
                                    rows="3"
                                    onChange={handleChange}
                                    value={formData.event_description}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>Date *</label>
                                    <input
                                        name="event_date"
                                        type="text"
                                        placeholder="e.g. 10th Oct 2025"
                                        value={formData.event_date}
                                        onChange={handleChange}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Time *</label>
                                    <input
                                        name="event_time"
                                        type="text"
                                        placeholder="e.g. 9 AM - 5 PM"
                                        value={formData.event_time}
                                        onChange={handleChange}
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Venue *</label>
                                <input
                                    name="venue"
                                    placeholder="Event Venue"
                                    onChange={handleChange}
                                    value={formData.venue}
                                    className={inputCls}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>Duration (days) *</label>
                                    <input
                                        name="duration"
                                        type="number"
                                        placeholder="e.g. 2"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Cost (0 for free)</label>
                                    <input
                                        name="cost"
                                        type="number"
                                        placeholder="e.g. 0"
                                        value={formData.cost}
                                        onChange={handleChange}
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                                <input
                                    type="checkbox"
                                    name="teamEvent"
                                    checked={formData.teamEvent}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-dark-accent"
                                />
                                <label className="text-sm font-medium text-light-color dark:text-dark-color">
                                    Team Event
                                </label>
                            </div>

                            {formData.teamEvent && (
                                <div>
                                    <label className={labelCls}>Team Size</label>
                                    <input
                                        name="teamSize"
                                        type="number"
                                        placeholder="e.g. 4"
                                        value={formData.teamSize}
                                        onChange={handleChange}
                                        className={inputCls}
                                    />
                                </div>
                            )}

                            <div>
                                <label className={labelCls}>Poster URL *</label>
                                <input
                                    name="poster_url"
                                    placeholder="https://..."
                                    value={formData.poster_url}
                                    onChange={handleChange}
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Registration Form URL *</label>
                                <input
                                    name="registration_url"
                                    placeholder="https://..."
                                    value={formData.registration_url}
                                    onChange={handleChange}
                                    className={inputCls}
                                />
                            </div>

                            {/* Prerequisites */}
                            <div>
                                <label className={labelCls}>Prerequisites</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add prerequisite"
                                        value={prerequisiteInput}
                                        onChange={(e) => setPrerequisiteInput(e.target.value)}
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && (e.preventDefault(), addPrerequisite())
                                        }
                                        className={inputCls}
                                    />
                                    <button
                                        type="button"
                                        onClick={addPrerequisite}
                                        className={`${accentBtnCls} shrink-0`}
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.prerequisites.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {formData.prerequisites.map((p, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between items-center bg-light-background-dark dark:bg-dark-background-dark px-4 py-2.5 rounded-lg"
                                            >
                                                <span className="text-light-color dark:text-dark-color">{p}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removePrerequisite(i)}
                                                    className="text-sm font-medium text-red-500 hover:text-red-600"
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
                        <div className="space-y-8">
                            {/* Speakers Section */}
                            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                <h3 className={sectionCls}>Speakers</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelCls}>Name</label>
                                        <input
                                            name="name"
                                            placeholder="Speaker Name"
                                            value={speakerInput.name}
                                            onChange={handleArrayInput(setSpeakerInput)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Designation</label>
                                        <input
                                            name="designation"
                                            placeholder="e.g. Industry Expert"
                                            value={speakerInput.designation}
                                            onChange={handleArrayInput(setSpeakerInput)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Details</label>
                                        <textarea
                                            name="details"
                                            placeholder="About the speaker"
                                            value={speakerInput.details}
                                            onChange={handleArrayInput(setSpeakerInput)}
                                            rows="2"
                                            className={`${inputCls} resize-none`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSpeaker}
                                        className={accentBtnCls}
                                    >
                                        Add Speaker
                                    </button>
                                </div>
                                {formData.speakers_details.length > 0 && (
                                    <div className="mt-5 space-y-3">
                                        {formData.speakers_details.map((speaker, i) => (
                                            <div
                                                key={i}
                                                className="bg-light-background-dark dark:bg-dark-background-dark p-4 rounded-lg flex justify-between items-start gap-4"
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-light-color dark:text-dark-color">{speaker.name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {speaker.designation}
                                                    </p>
                                                    <p className="text-sm mt-1 text-light-color dark:text-dark-color">{speaker.details}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpeaker(i)}
                                                    className="text-sm font-medium text-red-500 hover:text-red-600 shrink-0"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Sponsors Section */}
                            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                <h3 className={sectionCls}>Sponsors</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelCls}>Name</label>
                                        <input
                                            name="name"
                                            placeholder="Sponsor Name"
                                            value={sponsorInput.name}
                                            onChange={handleArrayInput(setSponsorInput)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Place / Level</label>
                                        <input
                                            name="place"
                                            placeholder="e.g. Gold Sponsor"
                                            value={sponsorInput.place}
                                            onChange={handleArrayInput(setSponsorInput)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Details</label>
                                        <textarea
                                            name="details"
                                            placeholder="About the sponsor"
                                            value={sponsorInput.details}
                                            onChange={handleArrayInput(setSponsorInput)}
                                            rows="2"
                                            className={`${inputCls} resize-none`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSponsor}
                                        className={accentBtnCls}
                                    >
                                        Add Sponsor
                                    </button>
                                </div>
                                {formData.sponsors_details.length > 0 && (
                                    <div className="mt-5 space-y-3">
                                        {formData.sponsors_details.map((sponsor, i) => (
                                            <div
                                                key={i}
                                                className="bg-light-background-dark dark:bg-dark-background-dark p-4 rounded-lg flex justify-between items-start gap-4"
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-light-color dark:text-dark-color">{sponsor.name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {sponsor.place}
                                                    </p>
                                                    <p className="text-sm mt-1 text-light-color dark:text-dark-color">{sponsor.details}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSponsor(i)}
                                                    className="text-sm font-medium text-red-500 hover:text-red-600 shrink-0"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* MEDIA TAB */}
                    {activeTab === "media" && (
                        <div>
                            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                <h3 className={sectionCls}>Gallery Images</h3>
                                <label className={labelCls}>
                                    {editingGalleryIndex !== null
                                        ? `Editing Image ${editingGalleryIndex + 1} of ${formData.gallery.length}`
                                        : "Add Image URL"}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={galleryInput}
                                        onChange={(e) => setGalleryInput(e.target.value)}
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && (e.preventDefault(), addGalleryImage())
                                        }
                                        className={inputCls}
                                    />
                                    {editingGalleryIndex !== null && (
                                        <button
                                            type="button"
                                            onClick={cancelGalleryEdit}
                                            className="shrink-0 px-4 py-2.5 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addGalleryImage}
                                        className={`${accentBtnCls} shrink-0`}
                                    >
                                        {editingGalleryIndex !== null ? "Update Image" : "Add Image"}
                                    </button>
                                </div>
                                {formData.gallery.length > 0 && (
                                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {formData.gallery.map((url, i) => (
                                            <div
                                                key={i}
                                                className={`bg-light-background-dark dark:bg-dark-background-dark p-3 rounded-lg flex justify-between items-center gap-3 ${i === editingGalleryIndex
                                                        ? "ring-2 ring-dark-accent"
                                                        : ""
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-300">IMG</span>
                                                    </div>
                                                    <span className="text-sm truncate text-light-color dark:text-dark-color">{url}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => editGalleryImage(i)}
                                                        className="text-sm font-medium text-blue-500 hover:text-blue-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(i)}
                                                        className="text-sm font-medium text-red-500 hover:text-red-600"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* CERTIFICATES TAB */}
                    {activeTab === "certificates" && (
                        <div>
                            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                <h3 className={sectionCls}>Certificate Templates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelCls}>Organizers Certificate URL</label>
                                        <input
                                            placeholder="https://..."
                                            value={formData.certificate.organizers}
                                            onChange={(e) => handleNestedChange("certificate", "organizers", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Volunteers Certificate URL</label>
                                        <input
                                            placeholder="https://..."
                                            value={formData.certificate.volunteers}
                                            onChange={(e) => handleNestedChange("certificate", "volunteers", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Participants Certificate URL</label>
                                        <input
                                            placeholder="https://..."
                                            value={formData.certificate.participants}
                                            onChange={(e) => handleNestedChange("certificate", "participants", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>First Place Certificate URL</label>
                                        <input
                                            placeholder="https://..."
                                            value={formData.certificate.first_place}
                                            onChange={(e) => handleNestedChange("certificate", "first_place", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Second Place Certificate URL</label>
                                        <input
                                            placeholder="https://..."
                                            value={formData.certificate.second_place}
                                            onChange={(e) => handleNestedChange("certificate", "second_place", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Third Place Certificate URL</label>
                                        <input
                                            placeholder="https://..."
                                            value={formData.certificate.third_place}
                                            onChange={(e) => handleNestedChange("certificate", "third_place", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* CONFIG TAB */}
                    {activeTab === "config" && (
                        <div className="space-y-8">
                            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                <h3 className={sectionCls}>Database Configuration</h3>
                                <div>
                                    <label className={labelCls}>Database Name</label>
                                    <input
                                        name="database"
                                        placeholder="Database Name"
                                        value={formData.database}
                                        onChange={handleChange}
                                        className={inputCls}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                                    <div>
                                        <label className={labelCls}>Organizers Collection</label>
                                        <input
                                            placeholder="organizers"
                                            value={formData.collection.organizers}
                                            onChange={(e) => handleNestedChange("collection", "organizers", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Volunteers Collection</label>
                                        <input
                                            placeholder="volunteers"
                                            value={formData.collection.volunteers}
                                            onChange={(e) => handleNestedChange("collection", "volunteers", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Participants Collection</label>
                                        <input
                                            placeholder="participants"
                                            value={formData.collection.participants}
                                            onChange={(e) => handleNestedChange("collection", "participants", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                <h3 className={sectionCls}>JIMP Configuration (Certificate Text)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className={labelCls}>Y Offset</label>
                                        <input
                                            type="number"
                                            placeholder="-70"
                                            value={formData.jimp_config.yOffset}
                                            onChange={(e) => handleNestedChange("jimp_config", "yOffset", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Text Color</label>
                                        <input
                                            placeholder="white"
                                            value={formData.jimp_config.color}
                                            onChange={(e) => handleNestedChange("jimp_config", "color", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Font Size</label>
                                        <input
                                            type="number"
                                            placeholder="64"
                                            value={formData.jimp_config.font_size}
                                            onChange={(e) => handleNestedChange("jimp_config", "font_size", e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-dark-accent"
                                />
                                <label className="text-sm font-medium text-light-color dark:text-dark-color">
                                    Event is Active
                                </label>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-6 py-2.5 rounded-lg bg-dark-accent text-black font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.02]"
                    >
                        {isEdit ? "Save Changes" : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEventModal;