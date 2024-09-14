import Event from "@/utils/models/events.model";

async function updateEvent(slug, req, res) {
    try {
        //find and update
        const updateEvent = await Event.findOneAndUpdate(
            { slug: slug },
            req.body,
            { new: true }
        );
        //if updateEvent has some kind of error
        if (!updateEvent) {
            res.status(400).json({ success: false, error: "user not found" });
        }

        res.status(200).json({ success: true, data: updateEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default updateEvent;
