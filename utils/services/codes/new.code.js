import VipCode from "@/utils/models/vip_code.model";

async function newVipCode(req, res) {
    try {
        const vipcode = new VipCode(req.body);
        await vipcode.save();
        res.status(201).json({
            success: true,
            data: vipcode
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
