import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    event_name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    event_description: {
        type: String,
        required: true
    },
    speakers_details: [
        {
            name: {
                type: String,
                required: true
            },
            designation: {
                type: String,
                required: true
            },
            details: {
                type: String,
                default: ""
            }
        }
    ],
    event_date: {
        type: String,
        required: true
    },
    event_time: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: false
    },
    venue: {
        type: String,
        required: true
    },
    sponsors_details: [
        {
            name: {
                type: String,
                default: ""
            },
            place: {
                type: String,
                default: ""
            },
            details: {
                type: String,
                default: ""
            }
        }
    ],
    duration: {
        type: Number,
        required: true
    },
    prerequisites: [String],
    cost: {
        type: Number,
        default: 0
    },
    poster_url: {
        type: String,
        required: true
    },
    registration_url: {
        type: String,
        required: true
    },
    database: {
        type: String,
        required: true
    },
    collection: {
        participants: {
            type: String,
            required: true
        },
        organizers: {
            type: String,
            required: true
        },
        volunteers: {
            type: String,
            required: true
        }
    },
    certificate: {
        organizers: {
            type: String,
            required: true
        },
        participants: {
            type: String,
            required: true
        },
        volunteers: {
            type: String,
            required: true
        }
    },
    jimp_config: {
        yOffset: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        font_size: {
            type: String,
            required: true
        }
    },
    teamEvent: {
        type: Boolean,
        default: false
    },
    teamSize: {
        type: Number,
        required: true
    }
});

const Event = mongoose.models.events || mongoose.model("events", eventSchema);

export default Event;
