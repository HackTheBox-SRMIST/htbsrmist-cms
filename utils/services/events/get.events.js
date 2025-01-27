import Event from "@/utils/models/event.models";

async function getEvent(slug, res) {
    try {
        const event = await Event.findOne({ slug: slug });
        if (!event) {
            res.status(404).json({ success: false, error: "Event not found" });
        }
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default getEvent;
