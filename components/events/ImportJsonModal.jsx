import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useTheme } from "@/provider/ThemeProvider";
import { Themes } from "@/utils/misc/themes";
import { Plus, X, Eye, Upload, Download, Search, Users, RefreshCw, Database, Check } from "lucide-react";

const BUILT_IN_CATEGORIES = [
    { id: "participants", label: "Participants" },
    { id: "organizers", label: "Organizers" },
    { id: "volunteers", label: "Volunteers" },
    { id: "first_prize", label: "1st Prize" },
    { id: "sec_prize", label: "2nd Prize" },
    { id: "third_prize", label: "3rd Prize" },
];

const formatCategoryLabel = (key) => {
    const special = {
        participants: "Participants",
        organizers: "Organizers",
        volunteers: "Volunteers",
        first_prize: "1st Prize",
        sec_prize: "2nd Prize",
        third_prize: "3rd Prize",
        first_place: "1st Prize",
        second_place: "2nd Prize",
        third_place: "3rd Prize",
    };
    if (special[key]) return special[key];
    return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getCategoryConfig = (id, label) => {
    return {
        id,
        label,
        description: `Recipients will be saved to the "${id}" collection in this event database. Matched by email to prevent duplicates.`,
        requiredFields: [
            { field: "name", description: "Full name (compulsory)" },
            { field: "email", description: "Email address (compulsory)" },
        ],
        optionalNote:
            "Compulsory: name & email only. All other fields (usn, dept, phn) are completely optional.",
        sample: `[
  {
    "name": "Akshay Raj",
    "email": "as4958@srmist.edu.in",
    "usn": "RA2111030010200",
    "dept": "NWC"
  },
  {
    "name": "Jane Smith",
    "email": "js1234@srmist.edu.in",
    "usn": "RA2111003010002",
    "dept": "CSE"
  }
]`,
    };
};

const ImportJsonModal = ({ slug, event, onClose, onImported }) => {
    const eventSlug = slug || event?.slug || "";
    const [mode, setMode] = useState("view"); // "view" | "import" | "export"
    const [customCategories, setCustomCategories] = useState([]);
    const [showAddCustom, setShowAddCustom] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [activeTab, setActiveTab] = useState("participants");

    // Records view state
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentDatabase, setCurrentDatabase] = useState(
        event?.database || (eventSlug ? `prod_${eventSlug}` : "")
    );

    // Import state
    const [items, setItems] = useState([]);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const [importing, setImporting] = useState(false);
    const [isImported, setIsImported] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const toast = useToast();
    const { isDark } = useTheme();

    const showToast = (status, title, description) => {
        const palette = isDark ? Themes.dark : Themes.light;
        toast({
            title,
            description,
            status,
            duration: 4500,
            isClosable: true,
            position: "top-right",
            containerStyle: {
                background: palette[status]?.background || palette.info.background,
                color: palette[status]?.color || palette.info.color,
            },
        });
    };

    // Merge built-in, certificate-configured, and user-added custom categories
    const categories = useMemo(() => {
        const set = new Map();

        // 1. Built-in defaults
        BUILT_IN_CATEGORIES.forEach((cat) => {
            set.set(cat.id, cat);
        });

        // 2. Extra keys present in event.certificate
        if (event?.certificate && typeof event.certificate === "object") {
            Object.keys(event.certificate).forEach((key) => {
                if (key !== "_id" && key.trim() !== "" && !set.has(key)) {
                    set.set(key, { id: key, label: formatCategoryLabel(key) });
                }
            });
        }

        // 3. User-added custom categories
        customCategories.forEach((cat) => {
            if (!set.has(cat.id)) {
                set.set(cat.id, cat);
            }
        });

        return Array.from(set.values());
    }, [event?.certificate, customCategories]);

    const activeCategory =
        categories.find((c) => c.id === activeTab) ||
        categories[0] || { id: "participants", label: "Participants" };

    const currentConfig = useMemo(
        () => getCategoryConfig(activeCategory.id, activeCategory.label),
        [activeCategory]
    );

    // Fetch records when category changes or modal opens
    const fetchRecords = async (targetId) => {
        if (!eventSlug) return;
        setLoadingRecords(true);
        try {
            const res = await axios.get(
                `/api/v1/events/participants/${eventSlug}?target=${targetId}`
            );
            setRecords(res.data?.data || []);
            if (res.data?.database) {
                setCurrentDatabase(res.data.database);
            }
        } catch (err) {
            console.error("Error fetching list:", err);
            setRecords([]);
        } finally {
            setLoadingRecords(false);
        }
    };

    useEffect(() => {
        if (eventSlug) {
            fetchRecords(activeTab);
        }
    }, [eventSlug, activeTab]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setItems([]);
        setFileName("");
        setError("");
        setResult(null);
        setIsImported(false);
        setSearchQuery("");
    };

    const handleAddCustomCategory = (e) => {
        e.preventDefault();
        const trimmed = newCategoryName.trim();
        if (!trimmed) return;

        const id = trimmed.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
        const newCat = { id, label: trimmed };

        if (!categories.some((c) => c.id === id)) {
            setCustomCategories((prev) => [...prev, newCat]);
        }
        setActiveTab(id);
        setNewCategoryName("");
        setShowAddCustom(false);
        setItems([]);
        setFileName("");
        setError("");
        setResult(null);
        setIsImported(false);
    };

    const handleFile = (file) => {
        if (!file) return;

        setIsImported(false);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let data = JSON.parse(e.target.result);
                // Support object wrappers like { data: [...] }, { participants: [...] }, etc.
                if (!Array.isArray(data) && data && typeof data === "object") {
                    const arrKey = Object.keys(data).find((k) => Array.isArray(data[k]));
                    if (arrKey) {
                        data = data[arrKey];
                    }
                }
                if (!Array.isArray(data)) {
                    setError(`JSON must contain an array of ${currentConfig.label.toLowerCase()} objects.`);
                    setItems([]);
                    setFileName("");
                    return;
                }
                setError("");
                setFileName(file.name);
                setResult(null);
                setItems(data);
            } catch (err) {
                setError("Invalid JSON file.");
                setItems([]);
                setFileName("");
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (items.length === 0) return;

        setImporting(true);
        setError("");
        setResult(null);
        setIsImported(false);
        try {
            const response = await axios.post(
                "/api/v1/events/participants/import",
                { slug: eventSlug, target: activeTab, participants: items }
            );
            const resData = response.data?.data;
            setResult(resData);
            setIsImported(true);
            setItems([]);
            setFileName("");

            // Trigger proper toast notification
            showToast(
                "success",
                "Imported Successfully",
                `Successfully imported ${resData?.added || 0} new and updated ${resData?.updated || 0} ${currentConfig.label.toLowerCase()} into ${resData?.collection || currentConfig.id}.`
            );

            // Refresh records in background
            fetchRecords(activeTab);

            if (onImported) {
                onImported();
            }

            // Keep the "Imported" button state visible for 1.2s before switching to view
            setTimeout(() => {
                setMode("view");
            }, 1200);
        } catch (err) {
            setIsImported(false);
            const errorMsg =
                err.response && err.response.data && err.response.data.error
                    ? err.response.data.error
                    : `Error importing ${currentConfig.label.toLowerCase()}.`;
            setError(errorMsg);
            showToast("error", "Import Failed", errorMsg);
        } finally {
            setImporting(false);
        }
    };

    const clearFile = () => {
        setItems([]);
        setFileName("");
        setError("");
        setResult(null);
        setIsImported(false);
    };

    const copySample = async () => {
        try {
            await navigator.clipboard.writeText(currentConfig.sample);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Error copying sample:", err);
        }
    };

    const exportJson = () => {
        if (!records || records.length === 0) return;
        const cleanRecords = records.map(({ _id, __v, ...rest }) => rest);
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(cleanRecords, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${eventSlug}_${activeTab}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const exportCsv = () => {
        if (!records || records.length === 0) return;
        const keys = Array.from(
            new Set(
                records.flatMap((r) =>
                    Object.keys(r).filter((k) => k !== "_id" && k !== "__v")
                )
            )
        );
        const csvRows = [];
        csvRows.push(keys.join(","));
        for (const row of records) {
            const values = keys.map((key) => {
                const val =
                    row[key] === undefined || row[key] === null
                        ? ""
                        : String(row[key]);
                const escaped = val.replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(","));
        }
        const csvContent =
            "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", csvContent);
        downloadAnchor.setAttribute("download", `${eventSlug}_${activeTab}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    // Table columns: name, email, usn, dept only
    const tableColumns = ["name", "email", "usn", "dept"];

    // Filter records for search across all document fields
    const filteredRecords = useMemo(() => {
        if (!searchQuery.trim()) return records;
        const q = searchQuery.toLowerCase();
        return records.filter((r) => {
            return Object.values(r || {}).some(
                (val) => val && String(val).toLowerCase().includes(q)
            );
        });
    }, [records, searchQuery]);

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-light-background-light dark:bg-dark-background-light shadow-2xl rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                {/* Modal Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-light-background-dark/20 dark:bg-dark-background-dark/20">
                    <div>
                        <h2 className="text-xl font-bold dark:text-dark-accent text-light-color">
                            Manage Lists
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {event?.event_name || eventSlug} &bull; {currentConfig.label} ({event?.database || (eventSlug ? `prod_${eventSlug}` : "")}.{currentConfig.id})
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Category Navigation Bar */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-5 pt-3 bg-light-background-dark/10 dark:bg-dark-background-dark/10">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 no-scrollbar">
                        {categories.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabChange(tab.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? "bg-dark-accent text-black shadow-sm"
                                        : "bg-light-background-darker/60 dark:bg-dark-background-darker/60 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}

                        {showAddCustom ? (
                            <form
                                onSubmit={handleAddCustomCategory}
                                className="inline-flex items-center gap-1.5 shrink-0"
                            >
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Category Name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-light-background-light dark:bg-dark-background-light text-light-color dark:text-dark-color focus:outline-none focus:ring-1 focus:ring-dark-accent"
                                />
                                <button
                                    type="submit"
                                    className="px-2 py-1 text-xs bg-dark-accent text-black font-semibold rounded-lg hover:opacity-90"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddCustom(false);
                                        setNewCategoryName("");
                                    }}
                                    className="px-1.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowAddCustom(true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-gray-400 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-dark-accent hover:text-dark-accent transition-colors shrink-0"
                                title="Add custom category or prize tier"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Custom</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-Mode Tabs: View List | Import List | Export List */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-5 pt-2 gap-4 bg-light-background-dark/5 dark:bg-dark-background-dark/5">
                    <button
                        type="button"
                        onClick={() => setMode("view")}
                        className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                            mode === "view"
                                ? "border-dark-accent text-dark-accent"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                        <span>View List ({loadingRecords ? "..." : records.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("import")}
                        className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                            mode === "import"
                                ? "border-dark-accent text-dark-accent"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        <Upload className="w-4 h-4" />
                        <span>Import List</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("export")}
                        className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                            mode === "export"
                                ? "border-dark-accent text-dark-accent"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                    >
                        <Download className="w-4 h-4" />
                        <span>Export List</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    {/* MODE 1: VIEW LIST */}
                    {mode === "view" && (
                        <div className="space-y-3">
                            {/* Database and Collection Information Banner */}
                            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-light-background-darker dark:bg-dark-background-darker border border-gray-200 dark:border-gray-700/80 text-xs">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-dark-accent shrink-0" />
                                    <span className="text-gray-500 dark:text-gray-400">Database:</span>
                                    <code className="font-mono font-bold text-dark-accent px-1.5 py-0.5 rounded bg-dark-accent/10">
                                        {currentDatabase || (event?.database ? event.database : (eventSlug ? `prod_${eventSlug}` : ""))}
                                    </code>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-gray-500 dark:text-gray-400">Collection:</span>
                                        <code className="font-mono font-semibold text-light-color dark:text-dark-color px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800">
                                            {currentConfig.id}
                                        </code>
                                    </div>
                                    <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Total: <strong className="text-light-color dark:text-dark-color">{records.length}</strong>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${currentConfig.label.toLowerCase()}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-light-background-darker dark:bg-dark-background-darker text-light-color dark:text-dark-color focus:outline-none focus:ring-1 focus:ring-dark-accent"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fetchRecords(activeTab)}
                                    disabled={loadingRecords}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Refresh list"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loadingRecords ? "animate-spin" : ""}`} />
                                </button>
                            </div>

                            {loadingRecords ? (
                                <div className="py-16 text-center text-gray-500 text-sm">
                                    Loading {currentConfig.label.toLowerCase()}...
                                </div>
                            ) : records.length === 0 ? (
                                <div className="py-14 text-center flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-light-background-darker dark:bg-dark-background-darker flex items-center justify-center mb-3 text-gray-400">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-semibold text-light-color dark:text-dark-color mb-1">
                                        No records in {currentConfig.label}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                                        Collection &quot;{currentConfig.id}&quot; in database &quot;{currentDatabase || (event?.database ? event.database : (eventSlug ? `prod_${eventSlug}` : ""))}&quot; is currently empty.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setMode("import")}
                                        className="px-4 py-2 bg-dark-accent text-black font-semibold text-xs rounded-lg hover:opacity-90 inline-flex items-center gap-1.5"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Import {currentConfig.label} Now</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-light-background-darker dark:bg-dark-background-darker font-semibold sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    {tableColumns.map((col) => (
                                                        <th
                                                            key={col}
                                                            className="py-2.5 px-3 font-mono text-[11px] text-dark-accent font-bold tracking-wider"
                                                        >
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-light-color dark:text-dark-color">
                                                {filteredRecords.map((r, i) => (
                                                    <tr
                                                        key={r._id || r.email || i}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                    >
                                                        {tableColumns.map((col) => {
                                                            const val = r[col];
                                                            const displayVal =
                                                                val === undefined || val === null || val === ""
                                                                    ? "—"
                                                                    : typeof val === "object"
                                                                    ? JSON.stringify(val)
                                                                    : String(val);
                                                            const isMono =
                                                                col === "email" ||
                                                                col === "usn" ||
                                                                col === "phone" ||
                                                                col === "phn";
                                                            return (
                                                                <td
                                                                    key={col}
                                                                    className={`py-2 px-3 text-xs ${
                                                                        col === "name"
                                                                            ? "font-medium text-light-color dark:text-dark-color"
                                                                            : isMono
                                                                            ? "font-mono text-[11px] text-gray-600 dark:text-gray-300"
                                                                            : "text-gray-500 dark:text-gray-400"
                                                                    }`}
                                                                >
                                                                    {displayVal}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                                {filteredRecords.length === 0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={tableColumns.length}
                                                            className="py-8 text-center text-gray-500"
                                                        >
                                                            No records match &quot;{searchQuery}&quot;
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-light-background-darker/60 dark:bg-dark-background-darker/60 px-3 py-2 text-[11px] text-gray-500 flex flex-wrap justify-between gap-2">
                                        <span>Showing {filteredRecords.length} of {records.length} records</span>
                                        <span>
                                            Database: <strong className="text-dark-accent font-mono">{currentDatabase || (event?.database ? event.database : (eventSlug ? `prod_${eventSlug}` : ""))}</strong> &bull; Collection: <strong className="text-light-color dark:text-dark-color font-mono">{currentConfig.id}</strong>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MODE 2: IMPORT LIST */}
                    {mode === "import" && (
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-light-color dark:text-dark-color">
                                    Choose JSON file for {currentConfig.label}
                                </span>
                                <input
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={(e) => handleFile(e.target.files[0])}
                                    disabled={importing}
                                    className="mt-1.5 w-full text-sm text-light-color dark:text-dark-color file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-accent file:text-black file:font-semibold hover:file:opacity-90 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 bg-light-background-darker dark:bg-dark-background-darker"
                                />
                            </label>

                            {fileName && (
                                <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-light-background-darker dark:bg-dark-background-darker border border-gray-300 dark:border-gray-700 text-xs">
                                    <p className="text-light-color dark:text-dark-color truncate">
                                        File: <strong className="font-mono">{fileName}</strong>
                                    </p>
                                    <span className="text-dark-accent font-semibold whitespace-nowrap font-mono">
                                        {items.length} records parsed
                                    </span>
                                </div>
                            )}

                            <div className="dark:bg-dark-info-background bg-light-info-background py-3 px-4 rounded-lg">
                                <p className="dark:text-dark-info-color text-light-info-color text-xs sm:text-sm">
                                    {currentConfig.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-light-color dark:text-dark-color mb-2">
                                    Required fields per entry
                                </h3>
                                <ul className="space-y-1">
                                    {currentConfig.requiredFields.map((item) => (
                                        <li
                                            key={item.field}
                                            className="flex items-start gap-2 text-sm text-light-color dark:text-dark-color"
                                        >
                                            <span className="dark:text-dark-accent text-light-color font-mono">*</span>
                                            <span>
                                                <code className="dark:bg-dark-background-darker bg-light-background-darker px-1.5 py-0.5 rounded text-light-color dark:text-dark-color">
                                                    {item.field}
                                                </code>
                                                <span className="ml-2 text-gray-500 dark:text-gray-400">
                                                    {item.description}
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {currentConfig.optionalNote}
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-semibold text-light-color dark:text-dark-color">
                                        Sample JSON ({currentConfig.label})
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={copySample}
                                        className="text-xs px-3 py-1.5 rounded-lg bg-light-background-darker dark:bg-dark-background-darker text-light-color dark:text-dark-color hover:opacity-80"
                                    >
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <pre className="dark:bg-dark-background-darker bg-light-background-darker border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-xs text-light-color dark:text-dark-color overflow-x-auto custom-scrollbar">
                                    {currentConfig.sample}
                                </pre>
                            </div>

                            {error && (
                                <div className="dark:bg-dark-error-background bg-light-error-background py-3 px-4 rounded-lg">
                                    <p className="dark:text-dark-error-color text-light-error-color text-sm text-center">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {result && (
                                <div className="dark:bg-dark-success-background bg-light-success-background py-3 px-4 rounded-lg flex items-center justify-between gap-3">
                                    <p className="dark:text-dark-success-color text-light-success-color text-sm">
                                        Import complete ({result.collection || result.target}) — Added: {result.added}, Updated: {result.updated},
                                        Skipped: {result.skipped} | Total: {result.total}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setMode("view")}
                                        className="px-3 py-1 bg-dark-accent text-black font-semibold text-xs rounded-lg hover:opacity-90 shrink-0"
                                    >
                                        View Records
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MODE 3: EXPORT LIST */}
                    {mode === "export" && (
                        <div className="space-y-4">
                            {records.length === 0 ? (
                                <div className="py-14 text-center flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-light-background-darker dark:bg-dark-background-darker flex items-center justify-center mb-3 text-gray-400">
                                        <Download className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-semibold text-light-color dark:text-dark-color mb-1">
                                        List is empty
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                                        There are no records in {currentConfig.label} to export. Import data first to enable exports.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setMode("import")}
                                        className="px-4 py-2 bg-dark-accent text-black font-semibold text-xs rounded-lg hover:opacity-90 inline-flex items-center gap-1.5"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Import {currentConfig.label}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-light-background-dark/20 dark:bg-dark-background-dark/20">
                                        <p className="text-sm font-semibold text-light-color dark:text-dark-color">
                                            {records.length} records available for export
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Download all entries from the {currentConfig.label} collection in JSON or CSV format.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={exportJson}
                                            className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-dark-accent bg-light-background-darker dark:bg-dark-background-darker text-light-color dark:text-dark-color font-semibold text-sm transition-all hover:scale-[1.01]"
                                        >
                                            <Download className="w-4 h-4 text-dark-accent" />
                                            <span>Export JSON (.json)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={exportCsv}
                                            className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-dark-accent bg-light-background-darker dark:bg-dark-background-darker text-light-color dark:text-dark-color font-semibold text-sm transition-all hover:scale-[1.01]"
                                        >
                                            <Download className="w-4 h-4 text-dark-accent" />
                                            <span>Export CSV (.csv)</span>
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                            Sample Preview (first record)
                                        </h4>
                                        <pre className="dark:bg-dark-background-darker bg-light-background-darker border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-xs text-light-color dark:text-dark-color overflow-x-auto custom-scrollbar">
                                            {JSON.stringify(records[0] || {}, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 bg-light-background-dark/20 dark:bg-dark-background-dark/20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 text-sm font-medium"
                    >
                        Close
                    </button>
                    {mode === "import" && (
                        <button
                            type="button"
                            onClick={isImported ? () => setMode("view") : handleImport}
                            disabled={importing || (!isImported && items.length === 0)}
                            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                                isImported
                                    ? "bg-green-500 text-black hover:bg-green-400 cursor-pointer shadow-md"
                                    : importing || items.length === 0
                                    ? "bg-dark-accent text-black opacity-50 cursor-not-allowed"
                                    : "bg-dark-accent text-black hover:opacity-90 cursor-pointer"
                            }`}
                        >
                            {isImported ? (
                                <>
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    <span>Imported</span>
                                </>
                            ) : importing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Importing...</span>
                                </>
                            ) : items.length > 0 ? (
                                `Import ${items.length} ${currentConfig.label}`
                            ) : (
                                `Import ${currentConfig.label}`
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportJsonModal;