import newVipCode from "@/utils/services/codes/new.code";
import DBInstance from "@/utils/db";

DBInstance();

async function codeCreationHandler(req, res) {
    if (req.method === "POST") {
        return await newVipCode(req, res);
    } else {
        res.status(405).json({
            success: false,
            message: "Method Not Allowed"
        });
    }
}

export default codeCreationHandler;
