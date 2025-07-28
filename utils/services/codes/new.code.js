import VipCode from "@/utils/models/vip_code.model";

async function newVipCode(req, res) {
    try {
        const vip_code = new VipCode(req.body);
        await vip_code.save();
        res.status(201).json({
            success: true,
            data: vip_code
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default newVipCode;
