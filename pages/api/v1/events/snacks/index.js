import dbInstance from "@/utils/db";
import Event from "@/utils/models/event.models";
import mongoose from "mongoose";
import getParticipantModel from "@/utils/models/participant.models";

dbInstance();

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { slug, email } = req.body;

        try {
            const event = await Event.findOne({ slug });

            if (!event) {
                return res
                    .status(404)
                    .json({ success: false, error: "Event not found" });
            }

            const { database, collection } = event;
            const db = mongoose.connection.useDb(database);

            const Participant = getParticipantModel(
                db,
                collection.participants
            );

            const participant = await Participant.findOne({ email });

            if (!participant) {
                return res
                    .status(404)
                    .json({ success: false, error: "Participant not found" });
            }

            if (!participant.rsvp || !participant.checkin) {
                return res.status(400).json({
                    success: false,
                    error: "Participant must RSVP and check-in before claiming snacks."
                });
            }

            participant.snacks = true;
            await participant.save();

            res.status(200).json({ success: true, data: participant });
        } catch (error) {
            console.error("Error updating snacks status:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
