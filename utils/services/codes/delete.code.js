import VipCode from "@/utils/models/vip_code.model";

async function deleteVipCode(code, req, res) {
    try {
        await VipCode.deleteOne({ code: code });
        res.status(200).json({
            success: true,
            message: "Code Deleted Successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export default deleteVipCode;
