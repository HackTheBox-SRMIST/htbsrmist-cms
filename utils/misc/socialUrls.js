/**
 * Shared utility for URL validation, auto-detection, and formatting.
 * Display/render-time only logic ported from main-repo (htbsrmistV1).
 * Never applied on submit or when saving to DB.
 */

export const isValidSocialUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (trimmed.length <= 2) return false;
    const lower = trimmed.toLowerCase();
    const placeholders = [
        "na",
        "n/a",
        "nil",
        "none",
        "-",
        ".",
        "null",
        "undefined",
        "n.a."
    ];
    if (placeholders.includes(lower)) {
        return false;
    }
    return true;
};

export const formatExternalUrl = (url) => {
    if (!url || typeof url !== "string") return "#";
    const trimmed = url.trim();
    if (!trimmed) return "#";

    // Extract URL if embedded in text
    const match = trimmed.match(/(https?:\/\/[^\s]+)/i);
    if (match) {
        return match[1];
    }

    if (/^(https?:\/\/|\/\/|mailto:|tel:)/i.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
};

export const detectSocialPlatform = (url) => {
    if (!url || typeof url !== "string") return "website";
    const lower = url.toLowerCase().trim();
    if (lower.includes("instagram.com") || lower.includes("instagr.am")) {
        return "instagram";
    }
    if (lower.includes("linkedin.com")) {
        return "linkedin";
    }
    if (lower.includes("twitter.com") || /(^|[\/\.])x\.com(\/|$)/i.test(lower)) {
        return "twitter";
    }
    if (lower.includes("github.com")) {
        return "github";
    }
    return "website";
};

export const isImageKitUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    return url.trim().includes("ik.imagekit.io");
};

export const isImageUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (isImageKitUrl(trimmed)) return true;
    if (/^data:image\//i.test(trimmed)) return true;
    const cleanPath = trimmed.split("?")[0].split("#")[0];
    return /\.(jpe?g|png|gif|webp|svg|avif|bmp|ico)$/i.test(cleanPath);
};

export const getTransformedImageUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (trimmed.includes("ik.imagekit.io")) {
        try {
            const urlObj = new URL(trimmed);
            const existingTr = urlObj.searchParams.get("tr");
            if (!existingTr) {
                urlObj.searchParams.set("tr", "w-500,h-500,fo-auto");
                return urlObj.toString();
            } else if (!existingTr.includes("w-") && !existingTr.includes("h-")) {
                urlObj.searchParams.set("tr", `${existingTr},w-500,h-500,fo-auto`);
                return urlObj.toString();
            }
            return trimmed;
        } catch {
            const separator = trimmed.includes("?") ? "&" : "?";
            if (!trimmed.includes("tr=")) {
                return `${trimmed}${separator}tr=w-500,h-500,fo-auto`;
            }
        }
    }
    return trimmed;
};
