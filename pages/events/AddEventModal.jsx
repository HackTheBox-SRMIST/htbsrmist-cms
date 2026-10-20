import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useTheme } from "@/provider/ThemeProvider";
import { Themes } from "@/utils/misc/themes";
import { Image as ImageIcon, Trash2, Edit2, ExternalLink } from "lucide-react";
import CertificateDesigner from "@/components/events/CertificateDesigner";

const AddEventModal = ({ onClose, onEventAdded, initialData = null }) => {
    const isEdit = Boolean(initialData);
    const toast = useToast();
    const { isDark } = useTheme();

    const showToast = (status, title, description) => {
        const palette = isDark ? Themes.dark : Themes.light;
        const themeBg = {
            success: palette.success.background,
            error: palette.error.background,
            info: palette.info.background,
            warning: palette.warn?.background || palette.info.background,
        };
        const themeText = {
            success: palette.success.color,
            error: palette.error.color,
            info: palette.info.color,
            warning: palette.warn?.color || palette.info.color,
        };
        toast({
            title,
            description,
            status,
            duration: 5000,
            isClosable: true,
            position: "top-right",
            containerStyle: {
                background: themeBg[status] || palette.info.background,
                color: themeText[status] || palette.info.color,
                border: `1px solid ${themeText[status] || palette.info.color}55`,
            },
        });
    };

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
        certificate: {},
        jimp_config: {
            yOffset: "-70",
            xOffset: "0",
            color: "white",
            font_size: "64",
        },
    };

    const normalizeGallery = (rawGallery) => {
        if (!rawGallery) return [];
        if (Array.isArray(rawGallery)) {
            return rawGallery
                .map((item) => (typeof item === "string" ? item.trim() : item?.url?.trim() || ""))
                .filter(Boolean);
        }
        if (typeof rawGallery === "string") {
            return rawGallery
                .split(/[\n,]+/)
                .map((s) => s.trim())
                .filter(Boolean);
        }
        return [];
    };

    const buildFormData = (data) => {
        if (!data) return { ...defaults };

        const base = { ...defaults };
        Object.keys(defaults).forEach((key) => {
            if (data[key] !== undefined && data[key] !== null) {
                if (key === "gallery") {
                    base.gallery = normalizeGallery(data.gallery);
                } else if (Array.isArray(defaults[key])) {
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
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setFormData(buildFormData(initialData));
        setGalleryInput("");
        setEditingGalleryIndex(null);
        setError("");
    }, [initialData]);

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
        const trimmed = galleryInput.trim();
        if (!trimmed) return;

        // Support single or multiple URLs (split by commas or newlines)
        const newUrls = trimmed
            .split(/[\n,]+/)
            .map((url) => url.trim())
            .filter((url) => url.length > 0);

        if (newUrls.length === 0) return;

        if (editingGalleryIndex !== null) {
            const updatedGallery = [...(formData.gallery || [])];
            updatedGallery[editingGalleryIndex] = newUrls[0];
            if (newUrls.length > 1) {
                updatedGallery.push(...newUrls.slice(1));
            }
            setFormData((prev) => ({
                ...prev,
                gallery: Array.from(new Set(updatedGallery)),
            }));
            setEditingGalleryIndex(null);
        } else {
            setFormData((prev) => ({
                ...prev,
                gallery: Array.from(new Set([...(prev.gallery || []), ...newUrls])),
            }));
        }
        setGalleryInput("");
    };

    const editGalleryImage = (index) => {
        setGalleryInput(formData.gallery[index] || "");
        setEditingGalleryIndex(index);
    };

    const cancelGalleryEdit = () => {
        setEditingGalleryIndex(null);
        setGalleryInput("");
    };

    const removeGalleryImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index),
        }));
        if (editingGalleryIndex === index) {
            setEditingGalleryIndex(null);
            setGalleryInput("");
        } else if (editingGalleryIndex !== null && editingGalleryIndex > index) {
            setEditingGalleryIndex(editingGalleryIndex - 1);
        }
    };

    const clearAllGallery = () => {
        setFormData((prev) => ({
            ...prev,
            gallery: [],
        }));
        setEditingGalleryIndex(null);
        setGalleryInput("");
    };

    // ----- Submit -----
    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
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
            showToast("warning", "Missing Required Fields", `Please fill in: ${missing.join(", ")}`);
            return;
        }

        if (formData.teamEvent && !formData.teamSize) {
            setError("Team size is required for team events");
            showToast("warning", "Missing Team Size", "Team size is required for team events");
            return;
        }

        // Auto-flush pending gallery input if user typed or pasted without clicking "Add Photo"
        let currentGallery = [...(formData.gallery || [])];
        if (galleryInput.trim()) {
            const pendingUrls = galleryInput
                .trim()
                .split(/[\n,]+/)
                .map((u) => u.trim())
                .filter(Boolean);

            if (editingGalleryIndex !== null) {
                currentGallery[editingGalleryIndex] = pendingUrls[0];
                if (pendingUrls.length > 1) {
                    currentGallery.push(...pendingUrls.slice(1));
                }
            } else {
                currentGallery.push(...pendingUrls);
            }
            currentGallery = Array.from(new Set(currentGallery));
        }

        const payload = {
            ...formData,
            gallery: currentGallery,
        };

        try {
            setSubmitting(true);
            if (isEdit) {
                await axios.patch(`/api/v1/events/${initialData.slug}`, payload);
                showToast(
                    "success",
                    "Event Updated",
                    `"${payload.event_name || initialData.event_name}" has been updated successfully.`
                );
            } else {
                await axios.post("/api/v1/events", payload);
                showToast(
                    "success",
                    "Event Created",
                    `"${payload.event_name}" has been created successfully.`
                );
            }
            onEventAdded();
            onClose();
        } catch (error) {
            console.error("Error saving event:", error);
            const serverMessage =
                error?.response?.data?.error || error?.message || "Unknown error";
            setError(`Error ${isEdit ? "updating" : "adding"} event: ${serverMessage}`);
            showToast(
                "error",
                isEdit ? "Failed to Update Event" : "Failed to Create Event",
                serverMessage
            );
        } finally {
            setSubmitting(false);
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
                        <div className="space-y-6">
                            <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-light-background-light dark:bg-dark-background-light">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                    <div>
                                        <h3 className={sectionCls + " mb-1"}>Event Gallery Photos</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Add photo URLs for event highlights, recaps, and gallery showcases. You can paste multiple URLs separated by commas or line breaks.
                                        </p>
                                    </div>
                                    {formData.gallery.length > 0 && (
                                        <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-dark-accent/20 text-dark-accent border border-dark-accent/40">
                                            {formData.gallery.length} photo{formData.gallery.length !== 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>

                                <label className={labelCls}>
                                    {editingGalleryIndex !== null
                                        ? `Editing Photo #${editingGalleryIndex + 1}`
                                        : "Image URL(s)"}
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/... or https://example.com/photo.jpg"
                                        value={galleryInput}
                                        onChange={(e) => setGalleryInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addGalleryImage();
                                            }
                                        }}
                                        className={inputCls}
                                    />
                                    <div className="flex gap-2 shrink-0">
                                        {editingGalleryIndex !== null && (
                                            <button
                                                type="button"
                                                onClick={cancelGalleryEdit}
                                                className="px-4 py-2.5 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={addGalleryImage}
                                            className={`${accentBtnCls} text-sm font-semibold`}
                                        >
                                            {editingGalleryIndex !== null ? "Update Photo" : "Add Photo"}
                                        </button>
                                    </div>
                                </div>

                                {formData.gallery.length > 0 ? (
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-light-color dark:text-dark-color">
                                                Gallery Photos ({formData.gallery.length})
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={clearAllGallery}
                                                className="text-xs text-red-500 hover:text-red-600 hover:underline"
                                            >
                                                Clear all photos
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {formData.gallery.map((url, i) => (
                                                <div
                                                    key={i}
                                                    className={`group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-light-background-dark dark:bg-dark-background-dark overflow-hidden transition-all duration-200 ${
                                                        i === editingGalleryIndex ? "ring-2 ring-dark-accent shadow-md" : ""
                                                    }`}
                                                >
                                                    <div className="relative aspect-video w-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={url}
                                                            alt={`Gallery photo ${i + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            onError={(e) => {
                                                                e.target.style.display = "none";
                                                                if (e.target.nextSibling) {
                                                                    e.target.nextSibling.style.display = "flex";
                                                                }
                                                            }}
                                                        />
                                                        <div
                                                            style={{ display: "none" }}
                                                            className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-2 text-center"
                                                        >
                                                            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                                            <span className="text-[11px] truncate max-w-[90%]">Image preview unavailable</span>
                                                        </div>
                                                        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-mono">
                                                            #{i + 1}
                                                        </span>
                                                    </div>

                                                    <div className="p-3">
                                                        <p className="text-xs truncate text-light-color dark:text-dark-color font-mono mb-2" title={url}>
                                                            {url}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-gray-700/60 text-xs">
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-gray-500 hover:text-dark-accent transition-colors"
                                                                title="Open original image"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                                <span>View</span>
                                                            </a>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => editGalleryImage(i)}
                                                                    className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
                                                                    title="Edit URL"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                    <span>Edit</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeGalleryImage(i)}
                                                                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                                                                    title="Remove photo"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    <span>Delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
                                        <ImageIcon className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                                        <p className="text-sm font-medium text-light-color dark:text-dark-color">
                                            No gallery photos added yet
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Add image URLs above to showcase event photos in the gallery.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* CERTIFICATES TAB */}
                    {activeTab === "certificates" && (
                        <div className="py-2">
                            <CertificateDesigner
                                certificate={formData.certificate}
                                jimp_config={formData.jimp_config}
                                onChangeCertificate={(field, value) => handleNestedChange("certificate", field, value)}
                                onChangeJimpConfig={(field, value) => handleNestedChange("jimp_config", field, value)}
                                onBatchChangeJimpConfig={(updates) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        jimp_config: {
                                            ...prev.jimp_config,
                                            ...updates,
                                        },
                                    }));
                                }}
                                eventName={formData.event_name}
                                isModal={false}
                            />
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
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={sectionCls + " mb-0"}>JIMP Configuration (Certificate Text)</h3>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("certificates")}
                                        className="text-xs font-semibold text-dark-accent hover:underline flex items-center gap-1"
                                    >
                                        Open Live Designer & Preview in Certificates Tab →
                                    </button>
                                </div>
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
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-lg bg-dark-accent text-black font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-[120px]"
                    >
                        {submitting && (
                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span>
                            {submitting
                                ? (isEdit ? "Saving..." : "Creating...")
                                : (isEdit ? "Save Changes" : "Submit")}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEventModal;