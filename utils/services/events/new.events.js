import Event from "@/utils/models/events.model";

async function newEvent(req, res) {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(200).json({
            success: true,
            data: newEvent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default newEvent;
