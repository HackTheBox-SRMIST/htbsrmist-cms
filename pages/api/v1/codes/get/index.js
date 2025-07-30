import getAllCodes from "@/utils/services/codes/getAll.code";
import DBInstance from "@/utils/db";

DBInstance();

async function getCodes(req, res) {
    if (req.method === "GET") {
        return await getAllCodes(req, res);
    } else {
        res.status(405).json({ success: false, message: "Method Not allowed" });
    }
}

export default getCodes;
