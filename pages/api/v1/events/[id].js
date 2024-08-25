import updateEvent from "@/utils/services/events/update.events";
import deleteEvent from "@/utils/services/events/delete.events";
import getEvent from "@/utils/services/events/get.events";
import DBInstance from "@/utils/db";

DBInstance();

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
