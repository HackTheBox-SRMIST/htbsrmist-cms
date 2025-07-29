import updateVipCodeStatus from "@/utils/services/codes/update.code";

function updateVipCodeHandler(req, res) {
    if (req.method === "POST") {
        const data = req.body;
        return updateVipCodeStatus(data.code, req, res);
    } else {
        res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }
}

export default updateVipCodeHandler;
