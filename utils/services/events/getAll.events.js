import Event from "@/utils/models/event.models";

async function getAllEvents(req, res) {
    try {
        const events = await Event.find();
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
}

export default getAllEvents;
