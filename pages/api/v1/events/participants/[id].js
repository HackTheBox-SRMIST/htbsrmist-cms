import DBInstance from "@/utils/db";
import Event from "@/utils/models/event.models";
import mongoose from "mongoose";
import getParticipantModel from "@/utils/models/participant.models";

DBInstance();

export default async function handler(req, res) {
    const { id } = req.query;
    const { method } = req;

    if (method === "GET") {
        try {
            const event = await Event.findOne({ slug: id });

            if (!event) {
                return res
                    .status(404)
                    .json({ success: false, error: "Event not found" });
            }

            const { database, collection } = event;
            const db = mongoose.connection.useDb(database);
            const participantsCollection = collection.participants;

            const Participant = db.model(
                participantsCollection,
                new mongoose.Schema({})
            );
            const participants = await Participant.find();

            res.status(200).json({ success: true, data: participants });
        } catch (error) {
            console.error("Error fetching participants:", error);
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

            const { database, collection } = event;
            const db = mongoose.connection.useDb(database);
            const participantsCollection = collection.participants;

            const Participant = getParticipantModel(db, participantsCollection);

            const { email } = req.body;
            const updatedParticipant = await Participant.findOneAndUpdate(
                { email: email },
                req.body,
                { new: true }
            );

            if (!updatedParticipant) {
                return res
                    .status(404)
                    .json({ success: false, error: "Participant not found." });
            }

            res.status(200).json({ success: true, data: updatedParticipant });
        } catch (error) {
            console.error("Error updating participant:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
