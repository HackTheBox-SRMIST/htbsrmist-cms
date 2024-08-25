import Event from "@/utils/models/events.model";
import DBInstance from "@/utils/db";

DBInstance();

//get all events
async function getAllEvents(res) {
    try {
        const events = await Event.find();

        res
            .status(200)
            .json({ success: true, data: events });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

//new Event
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

export default async function handler(req, res) {
    if (req.method === "GET") {
        await getAllEvents(res);
    } else if (req.method === "POST") {
        return await newEvent(req, res);
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
