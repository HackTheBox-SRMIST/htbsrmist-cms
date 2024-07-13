import Teams from "@/utils/models/teams.model";
import DBInstance from "@/utils/db";
DBInstance();

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const teams = await Teams.find();

            res.status(200).json({ success: true, data: teams });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
