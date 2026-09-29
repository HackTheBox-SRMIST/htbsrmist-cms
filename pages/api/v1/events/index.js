import Event from "@/utils/models/event.models";
import DBInstance from "@/utils/db";

DBInstance();

export default async function handler(req, res) {
  try {
    // ✅ Handle GET (fetch all events)
    if (req.method === "GET") {
      const events = await Event.find();
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

      // 🧩 Create new event dynamically
      const payload = {
        ...eventData,
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
