import Event from "@/utils/models/events.model";

async function getAllEvents(res) {
    try {
        const events = await Event.find();

        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default getAllEvents;
