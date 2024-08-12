import Event from "@/utils/models/events.model";
import DBInstance from "@/utils/db";

DBInstance();

//get Event by slug parameter
async function getEvent(slug, res) {
    try {
        const event = await Event.findOne({ slug: slug });
        if (!event) {
            res
                .status(404)
                .json({ success: false, error: "Event not found" });
        }
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false, error: "Internal Server Error"
        });
    }
}

//Delete Event by slug parameter
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
            success: false, error: "Internal Server Error"
        });
    }
}

//update Event by slug parameter
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
            success: false, error: "Internal Server Error"
        });
    }
}

export default async function handler(req, res) {
    const slug = req.query.id;

    if (req.method === "GET") {
        await getEvent(slug, res);
    } else if (req.method === "DELETE") {
        return await deleteEvent(slug, res);
    } else if (req.method === "PATCH") {
        await updateEvent(slug, req, res);
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
