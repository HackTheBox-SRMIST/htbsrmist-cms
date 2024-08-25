import Event from "@/utils/models/events.model";

async function deleteEvent(slug, res) {
    try {
        //id exists or not
        const checkID = await Event.findOne({ slug: slug });
        if (!checkID) {
            res.status(404).json({ success: false, error: "ID not found" });
        }

        const deleteID = await Event.findOneAndDelete({ slug: slug });
        console.log("delete=", deleteID);
        //verify
        if (!deleteID) {
            res.status(404).json({ success: false, error: "ID not found" });
        }

        return res.status(200).json({ success: true, data: deleteID });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default deleteEvent;
