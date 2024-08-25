import getAllEvents from "@/utils/services/events/getAll.events";
import newEvent from "@/utils/services/events/new.events";
import DBInstance from "@/utils/db";

DBInstance();

export default async function handler(req, res) {
    if (req.method === "GET") {
        await getAllEvents(res);
    } else if (req.method === "POST") {
        return await newEvent(req, res);
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
