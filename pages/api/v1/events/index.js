import Event from "@/utils/models/event.models";
import DBInstance from "@/utils/db";

DBInstance();

const parseEventDate = (event) => {
  if (!event) return 0;
  const rawDate = event.event_date ? String(event.event_date).trim() : "";

  if (!rawDate) {
    const idStr = String(event._id || "");
    if (idStr.length >= 8) {
      const ts = parseInt(idStr.substring(0, 8), 16);
      if (!isNaN(ts)) return ts * 1000;
    }
    return 0;
  }

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

  const dmyMatch = dateStr.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})$/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  let cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, "$1").trim();

  if (!/\b(20\d{2})\b/.test(cleaned)) {
    let fallbackYear = new Date().getFullYear();
    const idStr = String(event._id || "");
    if (idStr.length >= 8) {
      const idTime = parseInt(idStr.substring(0, 8), 16);
      if (!isNaN(idTime)) {
        fallbackYear = new Date(idTime * 1000).getFullYear();
      }
    }
    cleaned = `${cleaned} ${fallbackYear}`;
  }

  let parsed = Date.parse(cleaned);
  if (!isNaN(parsed)) return parsed;

  const direct = new Date(cleaned).getTime();
  if (!isNaN(direct)) return direct;

  const idStr = String(event._id || "");
  if (idStr.length >= 8) {
    const ts = parseInt(idStr.substring(0, 8), 16);
    if (!isNaN(ts)) return ts * 1000;
  }
  return 0;
};

export default async function handler(req, res) {
  try {
    // ✅ Handle GET (fetch all events sorted by latest date first)
    if (req.method === "GET") {
      const events = await Event.find().lean();
      events.sort((a, b) => parseEventDate(b) - parseEventDate(a));
      return res.status(200).json({ success: true, data: events });
    }

    // ✅ Handle POST (create new event)
    if (req.method === "POST") {
      const eventData = req.body;

      // 🧩 Required Fields
      const requiredFields = [
        "event_name",
        "slug",
        "event_description",
        "event_date",
        "event_time",
        "venue",
        "is_active",
        "poster_url",
        "registration_url",
        "duration",
        "teamEvent"
      ];

      // 🧩 Validate missing fields
      const missingFields = requiredFields.filter(
        (field) =>
          eventData[field] === undefined ||
          eventData[field] === null ||
          eventData[field] === ""
      );

      // 🧩 teamSize is only required for team events
      if (eventData.teamEvent && !eventData.teamSize) {
        missingFields.push("teamSize");
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`
        });
      }

      // 🧩 Normalize gallery if present
      let normalizedGallery = [];
      if (Array.isArray(eventData.gallery)) {
        normalizedGallery = eventData.gallery
          .map((s) => (typeof s === "string" ? s.trim() : s?.url?.trim() || ""))
          .filter(Boolean);
      } else if (typeof eventData.gallery === "string") {
        normalizedGallery = eventData.gallery
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      // 🧩 Create new event dynamically
      const payload = {
        ...eventData,
        gallery: normalizedGallery,
        teamSize: eventData.teamEvent ? Number(eventData.teamSize) : null
      };

      const newEvent = await Event.create(payload);

      return res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: newEvent
      });
    }

    // ❌ Unsupported HTTP methods
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
  } catch (error) {
    console.error("Error in /api/v1/events:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
}
