import mongoose from "mongoose";

const teamsSchema = new mongoose.Schema({
    index: {
        type: Number,
        required: true
    },
    usn: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    domain: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    caption: {
        type: String,
        required: true,
        trim: true
    },
    joined: {
        type: Number,
        required: true
    },
    pictureUrl: {
        type: String,
        required: true,
        trim: true
    },
    isCurrent: {
        type: Boolean,
        default: true
    },
    socials: {
        github: {
            type: String,
            trim: true
        },
        website: {
            type: String,
            trim: true
        },
        linkedin: {
            type: String,
            trim: true
        },
        twitter: {
            type: String,
            trim: true
        }
    }
});

const Teams = mongoose.model("teams", teamsSchema);

export default Teams;
