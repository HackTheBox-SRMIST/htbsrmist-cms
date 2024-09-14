// utils/models/participant.models.js
import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    usn: { type: String, required: true },
    email: { type: String, required: true },
    phn: { type: String, required: true },
    dept: { type: String, required: true },
    rsvp: { type: Boolean, default: false },
    checkin: { type: Boolean, default: false },
    snacks: { type: Boolean, default: false },
    isSrmite: { type: Boolean, default: true }
});

export default (db, collectionName) =>
    db.model(collectionName, participantSchema);
