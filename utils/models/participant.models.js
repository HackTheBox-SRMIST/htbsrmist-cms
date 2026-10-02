// utils/models/participant.models.js
import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
    },
    { strict: false, versionKey: false }
);

export default (db, collectionName) =>
    db.models[collectionName] || db.model(collectionName, participantSchema);
