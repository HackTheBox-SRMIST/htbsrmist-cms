import mongoose from "mongoose";

const vipCodeSchema = new mongoose.Schema({
    index: {
        type: Number,
        required: true,
        unique: true
    },

    code: {
        type: String,
        required: true,
        unique: true
    },

    isValid: {
        type: Boolean,
        required: true
    }
});

const VipCode =
    mongoose.models.VipCode || mongoose.model("VipCode", vipCodeSchema);
export default VipCode;
