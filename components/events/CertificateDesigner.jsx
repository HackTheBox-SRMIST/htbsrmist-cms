import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Award,
    Move,
    Eye,
    EyeOff,
    Download,
    RotateCcw,
    Check,
    Copy,
    ExternalLink,
    Plus,
    Trash2,
} from "lucide-react";
import {
    getSampleCertificateTemplate,
} from "@/utils/misc/certificateFonts";

const COMMON_SUGGESTED_TEMPLATES = [
    { key: "participants", label: "Participants" },
    { key: "organizers", label: "Organizers" },
    { key: "volunteers", label: "Volunteers" },
    { key: "first_prize", label: "First Prize" },
    { key: "sec_prize", label: "Sec Prize" },
    { key: "third_prize", label: "Third Prize" },
];

const formatTemplateLabel = (key) => {
    const special = {
        participants: "Participants",
        organizers: "Organizers",
        volunteers: "Volunteers",
        first_prize: "First Prize",
        sec_prize: "Sec Prize",
        third_prize: "Third Prize",
        first_place: "First Prize",
        second_place: "Sec Prize",
        third_place: "Third Prize",
    };
    if (special[key]) return special[key];
    return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

const PRESET_COLORS = [
    { name: "White", hex: "#FFFFFF", val: "white" },
    { name: "Black", hex: "#000000", val: "black" },
    { name: "Gold", hex: "#D4AF37", val: "#D4AF37" },
    { name: "Silver", hex: "#E2E8F0", val: "#E2E8F0" },
    { name: "HTB Green", hex: "#9FEF00", val: "#9FEF00" },
    { name: "Navy Blue", hex: "#1E3A8A", val: "#1E3A8A" },
];

const SAMPLE_NAMES = [
    { label: "Short", name: "Alex Roy" },
    { label: "Medium", name: "Johnathan Doe" },
    { label: "Long", name: "Dr. Christopher Montgomery" },
];

const CertificateDesigner = ({
    certificate = {},
    jimp_config = {},
    onChangeCertificate = () => {},
    onChangeJimpConfig = () => {},
    onBatchChangeJimpConfig = null,
    eventName = "Event Certificate",
    initialSelectedTemplate = "participants",
    isModal = false,
}) => {
    // Only show templates that exist in the DB (non-empty URL) plus any newly added in this session
    const [newlyAddedKeys, setNewlyAddedKeys] = useState([]);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [customTemplateInput, setCustomTemplateInput] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Compute configured templates from DB (ignore empty strings and MongoDB internals)
    const configuredKeys = Object.keys(certificate || {}).filter(
        (k) => typeof certificate[k] === "string" && certificate[k].trim() !== "" && k !== "_id"
    );

    // Visible template keys are ONLY those in the DB + any newly added by the user
    const visibleKeys = Array.from(new Set([...configuredKeys, ...newlyAddedKeys]));

    const [activeTemplateKey, setActiveTemplateKey] = useState(() => {
        if (initialSelectedTemplate && (configuredKeys.includes(initialSelectedTemplate) || newlyAddedKeys.includes(initialSelectedTemplate))) {
            return initialSelectedTemplate;
        }
        return visibleKeys[0] || "participants";
    });

    // Keep activeTemplateKey synced if current key disappears or when templates load
    useEffect(() => {
        if (visibleKeys.length > 0 && !visibleKeys.includes(activeTemplateKey)) {
            setActiveTemplateKey(visibleKeys[0]);
        }
    }, [visibleKeys, activeTemplateKey]);

    // Preview state
    const [sampleName, setSampleName] = useState("Johnathan Doe");
    const [showGuides, setShowGuides] = useState(true);
    const [copiedConfig, setCopiedConfig] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Drag & Drop tracking
    const previewContainerRef = useRef(null);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ startX: 0, startY: 0, origXOffset: 0, origYOffset: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // Derived values with safe defaults (default text_case = capitalize / Title Case)
    const yOffset = parseInt(jimp_config.yOffset ?? "-70", 10) || 0;
    const xOffset = parseInt(jimp_config.xOffset ?? "0", 10) || 0;
    const fontSize = parseInt(jimp_config.font_size ?? "64", 10) || 64;
    const color = jimp_config.color || "white";
    const fontFamily = "'Open Sans', sans-serif";
    const fontWeight = jimp_config.font_weight || "bold";
    const letterSpacing = parseInt(jimp_config.letter_spacing ?? "0", 10) || 0;
    const textCase = jimp_config.text_case || "capitalize";
    const alignment = jimp_config.alignment || "center";

    const updateJimp = (updates) => {
        if (onBatchChangeJimpConfig) {
            onBatchChangeJimpConfig(updates);
        } else {
            Object.entries(updates).forEach(([k, v]) => onChangeJimpConfig(k, v));
        }
    };

    const handleAddTemplate = (key) => {
        if (!key) return;
        const sanitizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
        if (!visibleKeys.includes(sanitizedKey)) {
            setNewlyAddedKeys((prev) => [...prev, sanitizedKey]);
        }
        setActiveTemplateKey(sanitizedKey);
        setShowAddMenu(false);
        setShowCustomInput(false);
        setCustomTemplateInput("");
    };

    const handleRemoveTemplate = (key) => {
        onChangeCertificate(key, "");
        setNewlyAddedKeys((prev) => prev.filter((k) => k !== key));
        const remaining = visibleKeys.filter((k) => k !== key);
        if (remaining.length > 0) {
            setActiveTemplateKey(remaining[0]);
        }
    };

    // Active template resolution (strictly ImageKit / URL, fallback to clean sample SVG)
    const activeUrlFromConfig = certificate[activeTemplateKey]?.trim() || "";
    const isCurrentTemplateInDb = Boolean(activeUrlFromConfig);
    const activeLabel = formatTemplateLabel(activeTemplateKey);

    const activeTemplateUrl =
        activeUrlFromConfig ||
        getSampleCertificateTemplate(activeLabel?.toUpperCase() + " CERTIFICATE");

    const getFormattedSampleName = () => {
        if (!sampleName) return "Johnathan Doe";
        if (textCase === "uppercase") return sampleName.toUpperCase();
        if (textCase === "capitalize") {
            return sampleName
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        }
        return sampleName;
    };

    // Mouse / Touch Drag Handlers
    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDraggingRef.current = true;
        setIsDragging(true);

        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

        dragStartRef.current = {
            startX: clientX,
            startY: clientY,
            origXOffset: xOffset,
            origYOffset: yOffset,
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("touchend", handleMouseUp);
    };

    const handlePointerMoveInternal = useCallback(
        (clientX, clientY) => {
            if (!isDraggingRef.current || !previewContainerRef.current) return;

            const container = previewContainerRef.current.getBoundingClientRect();
            if (container.width === 0 || container.height === 0) return;

            const scaleX = 1300 / container.width;
            const scaleY = 900 / container.height;

            const deltaScreenX = clientX - dragStartRef.current.startX;
            const deltaScreenY = clientY - dragStartRef.current.startY;

            let newX = Math.round(dragStartRef.current.origXOffset + deltaScreenX * scaleX);
            let newY = Math.round(dragStartRef.current.origYOffset + deltaScreenY * scaleY);

            // Subtle magnetic snap to center
            if (Math.abs(newX) < 7) newX = 0;
            if (Math.abs(newY) < 7) newY = 0;

            newX = Math.max(-600, Math.min(600, newX));
            newY = Math.max(-440, Math.min(440, newY));

            updateJimp({
                xOffset: String(newX),
                yOffset: String(newY),
            });
        },
        [updateJimp]
    );

    const handleMouseMove = (e) => {
        handlePointerMoveInternal(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
        if (e.touches?.[0]) {
            e.preventDefault();
            handlePointerMoveInternal(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleMouseUp);
    };

    const handleCanvasClick = (e) => {
        if (isDragging) return;
        if (!previewContainerRef.current) return;

        const container = previewContainerRef.current.getBoundingClientRect();
        const clickX = e.clientX - container.left;
        const clickY = e.clientY - container.top;

        const scaleX = 1300 / container.width;
        const scaleY = 900 / container.height;

        let newX = Math.round(clickX * scaleX - 650);
        let newY = Math.round(clickY * scaleY - 450);

        if (Math.abs(newX) < 8) newX = 0;
        if (Math.abs(newY) < 8) newY = 0;

        updateJimp({
            xOffset: String(newX),
            yOffset: String(newY),
        });
    };

    const handleDownloadSample = async () => {
        try {
            setDownloading(true);
            const canvas = document.createElement("canvas");
            canvas.width = 1300;
            canvas.height = 900;
            const ctx = canvas.getContext("2d");

            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => {
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => {
                        ctx.drawImage(fallbackImg, 0, 0, 1300, 900);
                        resolve();
                    };
                    fallbackImg.src = getSampleCertificateTemplate(
                        activeLabel?.toUpperCase() + " CERTIFICATE"
                    );
                };
                img.src = activeTemplateUrl;
            });

            if (img.complete && img.naturalWidth) {
                ctx.drawImage(img, 0, 0, 1300, 900);
            }

            ctx.save();
            ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
            ctx.fillStyle = color === "white" ? "#FFFFFF" : color === "black" ? "#000000" : color;
            ctx.textAlign = alignment;
            ctx.textBaseline = "middle";

            if (letterSpacing) {
                ctx.letterSpacing = `${letterSpacing}px`;
            }

            const targetX = 650 + xOffset;
            const targetY = 450 + yOffset;

            ctx.fillText(getFormattedSampleName(), targetX, targetY);
            ctx.restore();

            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `certificate_${activeTemplateKey}_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                setDownloading(false);
            }, "image/png");
        } catch (err) {
            console.error("Export error:", err);
            setDownloading(false);
        }
    };

    const handleCopyConfig = () => {
        const payload = JSON.stringify(
            {
                yOffset: String(yOffset),
                xOffset: String(xOffset),
                color: color,
                font_size: String(fontSize),
            },
            null,
            2
        );
        navigator.clipboard.writeText(payload);
        setCopiedConfig(true);
        setTimeout(() => setCopiedConfig(false), 2000);
    };

    const activeColorHex =
        PRESET_COLORS.find((p) => p.val === color)?.hex ||
        (color.startsWith("#") ? color : "#FFFFFF");

    // Unadded suggested templates for the "+ Add Template" menu
    const availableSuggestions = COMMON_SUGGESTED_TEMPLATES.filter(
        (t) => !visibleKeys.includes(t.key)
    );

    return (
        <div className="w-full text-light-color dark:text-dark-color font-sans">
            {/* Main Clean 2-Column Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* LEFT COLUMN: Clean Inspector (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    
                    {/* SECTION 1: TEMPLATE SELECTOR (ONLY WHAT'S IN DB + ADD ACTION) */}
                    <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-dark-background-dark/40 border border-gray-200 dark:border-gray-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Certificate Templates
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">
                                {visibleKeys.length} active
                            </span>
                        </div>

                        {/* Minimal Chips for Templates in DB */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                            {visibleKeys.length === 0 ? (
                                <div className="text-xs text-gray-500 py-1">
                                    No certificate templates configured yet.
                                </div>
                            ) : (
                                visibleKeys.map((key) => {
                                    const isSelected = activeTemplateKey === key;
                                    const hasUrl = Boolean(certificate[key]?.trim());
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                setActiveTemplateKey(key);
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                                isSelected
                                                    ? "bg-dark-accent text-black font-semibold shadow-sm"
                                                    : "bg-white dark:bg-dark-background-light border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    isSelected ? "bg-black" : hasUrl ? "bg-green-500" : "bg-amber-400"
                                                }`}
                                            />
                                            <span>{formatTemplateLabel(key)}</span>
                                        </button>
                                    );
                                })
                            )}

                            {/* Add Template Button / Popover */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowAddMenu(!showAddMenu)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-dashed border-gray-300 dark:border-gray-600 hover:border-dark-accent text-gray-500 dark:text-gray-400 hover:text-dark-accent transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Template</span>
                                </button>

                                {showAddMenu && (
                                    <div className="absolute top-full left-0 mt-1 z-30 w-52 bg-white dark:bg-dark-background-light rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1">
                                            Select Template
                                        </div>
                                        {availableSuggestions.map((s) => (
                                            <button
                                                key={s.key}
                                                type="button"
                                                onClick={() => handleAddTemplate(s.key)}
                                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                                            >
                                                {s.label}
                                            </button>
                                        ))}

                                        {!showCustomInput ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowCustomInput(true)}
                                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-dark-accent hover:bg-dark-accent/10 transition-colors font-medium border-t border-gray-100 dark:border-gray-800 mt-1 pt-1.5"
                                            >
                                                + Custom Template Name...
                                            </button>
                                        ) : (
                                            <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800 flex gap-1">
                                                <input
                                                    type="text"
                                                    placeholder="Template name"
                                                    value={customTemplateInput}
                                                    onChange={(e) => setCustomTemplateInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleAddTemplate(customTemplateInput);
                                                        }
                                                    }}
                                                    className="w-full bg-light-background-dark dark:bg-dark-background-dark px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700"
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddTemplate(customTemplateInput)}
                                                    disabled={!customTemplateInput.trim()}
                                                    className="px-2 py-1 rounded bg-dark-accent text-black font-semibold text-xs disabled:opacity-50"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Template Image URL Input (ImageKit URL Only) */}
                        {activeTemplateKey && (
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <label className="font-medium text-gray-600 dark:text-gray-300">
                                        {activeLabel} Image URL (ImageKit)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {activeUrlFromConfig && (
                                            <button
                                                type="button"
                                                onClick={() => onChangeCertificate(activeTemplateKey, "")}
                                                className="text-red-500 hover:underline text-[11px]"
                                            >
                                                Clear
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTemplate(activeTemplateKey)}
                                            className="text-gray-400 hover:text-red-500 text-[11px] flex items-center gap-0.5"
                                            title="Delete this template"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder="https://ik.imagekit.io/.../template.png"
                                        value={certificate[activeTemplateKey] || ""}
                                        onChange={(e) => onChangeCertificate(activeTemplateKey, e.target.value)}
                                        className="w-full bg-white dark:bg-dark-background-light border border-gray-300 dark:border-gray-700 px-3 py-1.5 pr-8 rounded-lg text-xs text-light-color dark:text-dark-color placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-dark-accent font-mono"
                                    />
                                    {isCurrentTemplateInDb && (
                                        <a
                                            href={activeUrlFromConfig}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute right-2.5 text-gray-400 hover:text-dark-accent"
                                            title="View image in new tab"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: TEXT & STYLE */}
                    <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-dark-background-dark/40 border border-gray-200 dark:border-gray-800 space-y-3.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Text Style
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">
                                Font: Open Sans
                            </span>
                        </div>

                        {/* Font Size & Weight Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Size</span>
                                    <span className="font-mono font-bold text-dark-accent">{fontSize}px</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="16"
                                        max="128"
                                        value={fontSize}
                                        onChange={(e) => updateJimp({ font_size: e.target.value })}
                                        className="w-full accent-dark-accent cursor-pointer"
                                    />
                                    <input
                                        type="number"
                                        value={fontSize}
                                        onChange={(e) => updateJimp({ font_size: e.target.value })}
                                        className="w-14 bg-white dark:bg-dark-background-light border border-gray-300 dark:border-gray-700 px-1 py-0.5 rounded text-xs text-center font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block">
                                    Weight
                                </label>
                                <select
                                    value={fontWeight}
                                    onChange={(e) => updateJimp({ font_weight: e.target.value })}
                                    className="w-full bg-white dark:bg-dark-background-light border border-gray-300 dark:border-gray-700 px-2.5 py-1.5 rounded-lg text-xs"
                                >
                                    <option value="normal">Normal (400)</option>
                                    <option value="bold">Bold (700)</option>
                                </select>
                            </div>
                        </div>

                        {/* Text Color & Case (Default Title Case) */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block">
                                    Color
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="color"
                                        value={activeColorHex}
                                        onChange={(e) => updateJimp({ color: e.target.value })}
                                        className="w-7 h-7 rounded border border-gray-300 dark:border-gray-700 bg-transparent p-0 cursor-pointer shrink-0"
                                    />
                                    <div className="flex items-center gap-1">
                                        {PRESET_COLORS.slice(0, 4).map((p) => (
                                            <button
                                                key={p.name}
                                                type="button"
                                                title={p.name}
                                                onClick={() => updateJimp({ color: p.val })}
                                                className={`w-5 h-5 rounded-full border transition-all ${
                                                    color === p.val
                                                        ? "ring-2 ring-dark-accent scale-110 border-white"
                                                        : "border-gray-400 hover:scale-105"
                                                }`}
                                                style={{ backgroundColor: p.hex }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block">
                                    Text Case
                                </label>
                                <select
                                    value={textCase}
                                    onChange={(e) => updateJimp({ text_case: e.target.value })}
                                    className="w-full bg-white dark:bg-dark-background-light border border-gray-300 dark:border-gray-700 px-2.5 py-1.5 rounded-lg text-xs"
                                >
                                    <option value="capitalize">Title Case (Default)</option>
                                    <option value="uppercase">UPPERCASE</option>
                                    <option value="none">As Typed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: POSITIONING */}
                    <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-dark-background-dark/40 border border-gray-200 dark:border-gray-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Position
                            </span>
                            <button
                                type="button"
                                onClick={() => updateJimp({ xOffset: "0", yOffset: "-70" })}
                                className="text-[11px] text-gray-400 hover:text-dark-accent flex items-center gap-1 transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset (0, -70)</span>
                            </button>
                        </div>

                        {/* Y Offset */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600 dark:text-gray-300">Vertical Offset (Y)</span>
                                <span className="font-mono font-bold text-dark-accent">{yOffset}px</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="-320"
                                    max="320"
                                    value={yOffset}
                                    onChange={(e) => updateJimp({ yOffset: e.target.value })}
                                    className="w-full accent-dark-accent cursor-pointer"
                                />
                                <input
                                    type="number"
                                    value={yOffset}
                                    onChange={(e) => updateJimp({ yOffset: e.target.value })}
                                    className="w-16 bg-white dark:bg-dark-background-light border border-gray-300 dark:border-gray-700 px-1.5 py-0.5 rounded text-xs text-center font-mono"
                                />
                            </div>
                        </div>

                        {/* X Offset */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600 dark:text-gray-300">Horizontal Offset (X)</span>
                                <div className="flex items-center gap-2">
                                    {xOffset !== 0 && (
                                        <button
                                            type="button"
                                            onClick={() => updateJimp({ xOffset: "0" })}
                                            className="text-[10px] text-dark-accent hover:underline"
                                        >
                                            Center X
                                        </button>
                                    )}
                                    <span className="font-mono font-bold text-dark-accent">{xOffset}px</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="-400"
                                    max="400"
                                    value={xOffset}
                                    onChange={(e) => updateJimp({ xOffset: e.target.value })}
                                    className="w-full accent-dark-accent cursor-pointer"
                                />
                                <input
                                    type="number"
                                    value={xOffset}
                                    onChange={(e) => updateJimp({ xOffset: e.target.value })}
                                    className="w-16 bg-white dark:bg-dark-background-light border border-gray-300 dark:border-gray-700 px-1.5 py-0.5 rounded text-xs text-center font-mono"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Clean Interactive Canvas & Toolbar (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                    
                    {/* Minimal Top Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50/70 dark:bg-dark-background-dark/40 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
                        {/* Sample Name Preview Input */}
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <span className="text-xs text-gray-500 whitespace-nowrap">Name:</span>
                            <input
                                type="text"
                                value={sampleName}
                                onChange={(e) => setSampleName(e.target.value)}
                                placeholder="Recipient name..."
                                className="bg-white dark:bg-dark-background-light border border-gray-300 dark:border-gray-700 px-2.5 py-1 rounded-lg text-xs w-full max-w-[200px]"
                            />
                            <div className="hidden sm:flex items-center gap-1">
                                {SAMPLE_NAMES.map((s) => (
                                    <button
                                        key={s.label}
                                        type="button"
                                        onClick={() => setSampleName(s.name)}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-dark-accent"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowGuides(!showGuides)}
                                title={showGuides ? "Hide Guidelines" : "Show Guidelines"}
                                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                                    showGuides
                                        ? "bg-dark-accent/20 border-dark-accent text-dark-accent"
                                        : "border-gray-300 dark:border-gray-700 text-gray-500"
                                }`}
                            >
                                {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span className="text-[11px] hidden sm:inline">Guides</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadSample}
                                disabled={downloading}
                                className="p-1.5 px-2.5 rounded-lg bg-dark-accent text-black font-semibold text-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{downloading ? "Saving..." : "PNG"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCopyConfig}
                                title="Copy Jimp Configuration"
                                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 hover:text-dark-accent"
                            >
                                {copiedConfig ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Interactive Canvas Container (1300x900 Aspect Ratio) */}
                    <div
                        ref={previewContainerRef}
                        onClick={handleCanvasClick}
                        className="relative w-full aspect-[1300/900] bg-black rounded-xl overflow-hidden border border-gray-300 dark:border-gray-800 shadow-xl select-none cursor-crosshair group"
                    >
                        {/* Background Template Image */}
                        <img
                            src={activeTemplateUrl}
                            alt="Certificate Template"
                            className="w-full h-full object-fill pointer-events-none"
                            draggable={false}
                        />

                        {/* Center Guidelines (if enabled) */}
                        {showGuides && (
                            <>
                                <div
                                    className={`absolute top-0 bottom-0 w-[1px] pointer-events-none transition-colors ${
                                        xOffset === 0
                                            ? "bg-green-400 opacity-80"
                                            : "bg-cyan-500/30 border-l border-dashed border-cyan-400/30"
                                    }`}
                                    style={{ left: "50%" }}
                                />
                                <div
                                    className={`absolute left-0 right-0 h-[1px] pointer-events-none transition-colors ${
                                        yOffset === 0
                                            ? "bg-green-400 opacity-80"
                                            : "bg-cyan-500/30 border-t border-dashed border-cyan-400/30"
                                    }`}
                                    style={{ top: "50%" }}
                                />
                            </>
                        )}

                        {/* Interactive Draggable Recipient Name Overlay */}
                        <div
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleMouseDown}
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-shadow rounded px-3 py-1 group/text ${
                                isDragging
                                    ? "ring-2 ring-dark-accent bg-black/40 shadow-xl"
                                    : "hover:ring-1 hover:ring-dark-accent/60 hover:bg-black/20"
                            }`}
                            style={{
                                left: `${50 + (xOffset / 1300) * 100}%`,
                                top: `${50 + (yOffset / 900) * 100}%`,
                                fontFamily: `"${fontFamily}", sans-serif`,
                                color: color === "white" ? "#FFFFFF" : color === "black" ? "#000000" : color,
                                fontWeight: fontWeight,
                                letterSpacing: `${letterSpacing}px`,
                                textAlign: alignment,
                                whiteSpace: "nowrap",
                                fontSize: `clamp(12px, calc(${fontSize}px * 0.5), calc(${fontSize}px * 1.0))`,
                            }}
                            title="Drag anywhere to reposition"
                        >
                            {isDragging && (
                                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-black/90 text-dark-accent text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none">
                                    X: {xOffset}px, Y: {yOffset}px
                                </div>
                            )}

                            <span>{getFormattedSampleName()}</span>
                        </div>

                        {/* Subtle Template Badge if URL empty */}
                        {!isCurrentTemplateInDb && (
                            <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm border border-gray-700/60 text-gray-300 text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1.5 pointer-events-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>Showing preview template ({activeLabel} URL empty in DB)</span>
                            </div>
                        )}
                    </div>

                    {/* Minimal Canvas Footer Hint */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1">
                        <span>Click or drag text on the certificate to position</span>
                        <span className="font-mono text-dark-accent">
                            X: {xOffset}px &middot; Y: {yOffset}px
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CertificateDesigner;
