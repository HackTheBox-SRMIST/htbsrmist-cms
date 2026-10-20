import getAllTeams from "@/utils/services/teams/getAll.teams";
import newTeams from "@/utils/services/teams/new.teams";
import DBInstance from "@/utils/db";

export default async function handler(req, res) {
    try {
        await DBInstance();
        if (req.method === "GET") {
            await getAllTeams(req, res);
        } else if (req.method === "POST") {
            return await newTeams(req, res);
        } else {
            res.status(405).json({ success: false, error: "Method Not Allowed" });
        }
    } catch (error) {
        console.error("API error in /api/v1/teams:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}
