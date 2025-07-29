import VipCode from "@/utils/models/vip_code.model";

// Req.body must contain either {is_valid: false} or {is_valid: true}

async function updateVipCodeStatus(code, req, res) {
    try {
        const { isValid } = req.body;
        const vip_code = await VipCode.findOneAndUpdate(
            { code: code },
            { isValid: isValid },
            {
                new: true,
                runValidators: true
            }
        );

        if (!vip_code) {
            res.status(404).json({ success: false, error: "Code not found" });
        } else {
            res.status(200).json({ success: true, data: vip_code });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default updateVipCodeStatus;
