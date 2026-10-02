import DBInstance from "@/utils/db";
import Event from "@/utils/models/event.models";
import mongoose from "mongoose";
import getParticipantModel from "@/utils/models/participant.models";

DBInstance();

export default async function handler(req, res) {
    const { id, target: rawTarget, collection: rawCollection } = req.query;
    const { method } = req;

    const targetParam = rawTarget || rawCollection || "participants";
    const cleanTarget = String(targetParam).trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_") || "participants";

    if (method === "GET") {
        try {
            const event = await Event.findOne({ slug: id });

            if (!event) {
                return res
                    .status(404)
                    .json({ success: false, error: "Event not found" });
            }

            const eventDbName = event.database || `prod_${event.slug || id}`;
            if (!event.database) {
                event.database = eventDbName;
                await event.save().catch(() => {});
            }
            const db = mongoose.connection.useDb(eventDbName);
            const targetCollection =
                (event.collection && event.collection[cleanTarget]) || cleanTarget;

            const TargetModel = getParticipantModel(db, targetCollection);
            const records = await TargetModel.find({}, { __v: 0 }).lean();

            res.status(200).json({
                success: true,
                database: eventDbName,
                target: cleanTarget,
                collection: targetCollection,
                data: records,
            });
        } catch (error) {
            console.error("Error fetching records:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    } else if (method === "PUT") {
        try {
            const event = await Event.findOne({ slug: id });

            if (!event) {
                return res
                    .status(404)
                    .json({ success: false, error: "Event not found." });
            }

            const eventDbName = event.database || `prod_${event.slug || id}`;
            if (!event.database) {
                event.database = eventDbName;
                await event.save().catch(() => {});
            }
            const db = mongoose.connection.useDb(eventDbName);
            const targetCollection =
                (event.collection && event.collection[cleanTarget]) || cleanTarget;

            const TargetModel = getParticipantModel(db, targetCollection);

            const { email } = req.body;
            const updatedRecord = await TargetModel.findOneAndUpdate(
                { email: email },
                req.body,
                { new: true }
            );

            if (!updatedRecord) {
                return res
                    .status(404)
                    .json({ success: false, error: "Record not found." });
            }

            res.status(200).json({ success: true, data: updatedRecord });
        } catch (error) {
            console.error("Error updating record:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
