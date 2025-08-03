import DBInstance from "@/utils/db";
import deleteVipCode from "@/utils/services/codes/delete.code";

DBInstance();

function deleteCodes(req, res) {
    if (req.method === "POST") {
        const data = req.body;
        return deleteVipCode(data.code, req, res);
    } else {
        res.status(405).json({
            success: false,
            message: "Method Not Allowed"
        });
    }
}

export default deleteCodes;
