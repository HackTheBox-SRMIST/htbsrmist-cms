import VipCode from "@/utils/models/vip_code.model";

async function getAllCodes(req, res) {
    try {
        const { index, isValid, code } = req.query;
        const filter = {};

        if (index) {
            filter.index = index;
        }

        if (isValid) {
            filter.isValid = isValid;
        }

        if (code) {
            filter.code = code;
        }

        const codes = await VipCode.find(filter);
        const sortedCodes = codes.sort((a, b) => a.index - b.index);

        res.status(200).json({ success: true, data: sortedCodes });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default getAllCodes;
