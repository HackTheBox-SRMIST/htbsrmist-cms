import mongoose from "mongoose";

const vipCodeSchema = new mongoose.Schema({
	index: {
		type: Number,
		required: true
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
})


const VipCode = mongoose.models.vipCodeSchema || mongoose.model("vip_codes", vipCodeSchema);
export default VipCode;
