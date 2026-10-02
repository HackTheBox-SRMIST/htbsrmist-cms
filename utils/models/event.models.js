import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  // === ✅ Core Required Fields (frontend must send) ===
  event_name: { type: String, required: true },
  slug: { type: String, required: true },
  event_description: { type: String, required: true },
  event_date: { type: String, required: true },
  event_time: { type: String, required: true },
  venue: { type: String, required: true },
  is_active: { type: Boolean, default: false },
  poster_url: { type: String, required: true },
  registration_url: { type: String, required: true },
  duration: { type: Number, required: true },
  teamEvent: { type: Boolean, default: false },
  teamSize: {
    type: Number,
    default: null,
    required: function () {
      return this.teamEvent === true;
    },
  },

  // === ✅ Backend-calculated or safe defaults ===
  rsvpLimit: { type: Number, default: 0 },

  speakers_details: {
    type: [
      {
        name: { type: String, default: "" },
        designation: { type: String, default: "" },
        details: { type: String, default: "" },
      },
    ],
    default: [],
  },

  sponsors_details: {
    type: [
      {
        name: { type: String, default: "" },
        place: { type: String, default: "" },
        details: { type: String, default: "" },
      },
    ],
    default: [],
  },

  prerequisites: { type: [String], default: [] },
  cost: { type: Number, default: 0 },

  // === ✅ Database & Collection Defaults (auto-generated) ===
  database: {
    type: String,
    default: function () {
      return `prod_${this.slug || "event"}`;
    },
  },

  collection: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      participants: "participants",
      organizers: "organizers",
      volunteers: "volunteers",
    },
  },

  certificate: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  jimp_config: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      yOffset: "-70",
      xOffset: "0",
      color: "white",
      font_size: "64",
    },
  },
});

const Event =
  mongoose.models.events || mongoose.model("events", eventSchema);

export default Event;
