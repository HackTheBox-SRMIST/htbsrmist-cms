import VipCode from "@/utils/models/vip_code.model";

async function getVipCode(code, req, res) {
    try {
        const vip_code = VipCode.findOne({ code: code });
        if (!vip_code) {
            res.status(404).json({ success: false, message: "Code Not Found" });
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

export default VipCode;
