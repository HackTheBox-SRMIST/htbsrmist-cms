/**
 * Shared utility for year calculations, formatting, cohort determination, and event years.
 */

export const formatTeamYear = (year) => {
    const yr = Number(year);
    if (!yr || isNaN(yr)) return String(year || "");
    if (yr >= 2026) {
        const nextYearSuffix = String(yr + 1).slice(-2);
        return `${yr}-${nextYearSuffix}`;
    }
    return String(yr);
};

export const getMemberYears = (member) => {
    if (!member) return [];
    if (Array.isArray(member.status) && member.status.length > 0) {
        const years = new Set();
        member.status.forEach((s) => {
            const yr = Number(s?.joined);
            if (yr && !isNaN(yr)) years.add(yr);
        });
        return Array.from(years).sort((a, b) => b - a);
    }
    const legacyJoined = Number(member.joined);
    if (legacyJoined && !isNaN(legacyJoined)) {
        return [legacyJoined];
    }
    return [];
};

export const getMemberLatestYear = (member) => {
    if (!member) return 0;
    if (Array.isArray(member.status) && member.status.length > 0) {
        let latest = 0;
        for (const s of member.status) {
            const yr = Number(s?.joined);
            if (yr > latest) {
                latest = yr;
            }
        }
        return latest;
    }
    return Number(member.joined) || 0;
};

/**
 * Builds continuous year options from maxYear down to fromYear (default 2023),
 * matching the main repo logic (htbsrmistV1/pages/team.tsx:158-189).
 *
 * maxYear is automatically computed as Math.max(latestYearInDb, currentYear).
 */
export const buildYearOptions = (membersOrYears = [], fromYear = 2023) => {
    let startFrom = 2023;
    let items = [];

    if (typeof membersOrYears === "number") {
        startFrom = membersOrYears;
    } else if (Array.isArray(membersOrYears)) {
        items = membersOrYears;
        if (typeof fromYear === "number") {
            startFrom = fromYear;
        }
    }

    const allYears = Array.from(
        new Set(
            items.flatMap((item) => {
                if (typeof item === "number" && !isNaN(item)) {
                    return [item];
                }
                if (typeof item === "string" && !isNaN(Number(item))) {
                    return [Number(item)];
                }
                if (item && typeof item === "object") {
                    return getMemberYears(item);
                }
                return [];
            })
        )
    )
        .filter((yr) => yr >= startFrom)
        .sort((a, b) => b - a);

    const currentYear = new Date().getFullYear();
    const latestJoinedYearInDb = allYears.length > 0 ? allYears[0] : 0;
    const maxYear = Math.max(latestJoinedYearInDb, currentYear);

    const yearsToShow = [];
    for (let yr = maxYear; yr >= startFrom; yr--) {
        yearsToShow.push(yr);
    }

    return Array.from(new Set([...allYears, ...yearsToShow])).sort((a, b) => b - a);
};

export const getEventTimestamp = (event) => {
    if (!event) return 0;
    const rawDate = event.event_date ? String(event.event_date).trim() : "";

    if (!rawDate) {
        if (event._id && typeof event._id === "string" && event._id.length >= 8) {
            const ts = parseInt(event._id.substring(0, 8), 16);
            if (!isNaN(ts)) return ts * 1000;
        }
        return 0;
    }

    // 1. If it has a date range like "3rd March - 10th March 2026" or "10th - 12th Oct 2025" or "10 to 12 Oct 2025"
    let dateStr = rawDate;
    if (dateStr.includes(" - ") || dateStr.includes(" to ") || dateStr.includes("–")) {
        const parts = dateStr.split(/ - | to |–/);
        const lastPart = parts[parts.length - 1].trim();
        if (/\d{4}/.test(lastPart)) {
            dateStr = lastPart;
        } else {
            const yearMatch = rawDate.match(/\b(20\d{2})\b/);
            if (yearMatch) {
                dateStr = `${lastPart} ${yearMatch[1]}`;
            }
        }
    }

    // 2. Check for DD/MM/YY or DD/MM/YYYY or DD-MM-YY(YY)
    const dmyMatch = dateStr.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})$/);
    if (dmyMatch) {
        let day = parseInt(dmyMatch[1], 10);
        let month = parseInt(dmyMatch[2], 10) - 1;
        let year = parseInt(dmyMatch[3], 10);
        if (year < 100) year += 2000;
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d.getTime();
    }

    // 3. Clean ordinals: 12th -> 12, 1st -> 1, 23th -> 23
    let cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, "$1").trim();

    // 4. Check if year is missing (e.g. "30th Sep" or "15 March")
    if (!/\b(20\d{2})\b/.test(cleaned)) {
        let fallbackYear = new Date().getFullYear();
        if (event._id && typeof event._id === "string" && event._id.length >= 8) {
            const idTime = parseInt(event._id.substring(0, 8), 16);
            if (!isNaN(idTime)) {
                fallbackYear = new Date(idTime * 1000).getFullYear();
            }
        } else if (event.createdAt) {
            const t = new Date(event.createdAt).getFullYear();
            if (!isNaN(t)) fallbackYear = t;
        }
        cleaned = `${cleaned} ${fallbackYear}`;
    }

    // 5. Try standard Date.parse and Date object
    let parsed = Date.parse(cleaned);
    if (!isNaN(parsed)) return parsed;

    const direct = new Date(cleaned).getTime();
    if (!isNaN(direct)) return direct;

    // 6. Fallback to MongoDB _id timestamp
    if (event._id && typeof event._id === "string" && event._id.length >= 8) {
        const ts = parseInt(event._id.substring(0, 8), 16);
        if (!isNaN(ts)) return ts * 1000;
    }
    if (event.createdAt) {
        const t = new Date(event.createdAt).getTime();
        if (!isNaN(t)) return t;
    }
    return 0;
};

export const getEventYear = (event) => {
    if (!event) return null;
    const ts = getEventTimestamp(event);
    if (ts) {
        const yr = new Date(ts).getFullYear();
        if (yr && !isNaN(yr)) return yr;
    }
    if (event._id && typeof event._id === "string" && event._id.length >= 8) {
        const idTime = parseInt(event._id.substring(0, 8), 16);
        if (!isNaN(idTime)) {
            const yr = new Date(idTime * 1000).getFullYear();
            if (yr && !isNaN(yr)) return yr;
        }
    }
    if (event.createdAt) {
        const yr = new Date(event.createdAt).getFullYear();
        if (yr && !isNaN(yr)) return yr;
    }
    return null;
};

export const determineCohortYear = (usn) => {
    if (!usn || typeof usn !== "string" || usn.length < 4) return "Unknown";
    const cohortDigits = parseInt(usn.substring(2, 4), 10);
    if (isNaN(cohortDigits)) return "Unknown";
    const cohortStart = 2000 + cohortDigits;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentAcademicYearStart = now.getMonth() >= 6 ? currentYear : currentYear - 1;
    const studyYear = Math.max(1, Math.min(4, currentAcademicYearStart - cohortStart + 1));
    const labels = {
        1: "1st",
        2: "2nd",
        3: "3rd",
        4: "4th"
    };
    return labels[studyYear] || "Unknown";
};
