import getTeams from "@/utils/services/teams/get.teams";
import updateTeams from "@/utils/services/teams/update.teams";
import deleteTeams from "@/utils/services/teams/delete.teams";
import DBInstance from "@/utils/db";

export default async function handler(req, res) {
    try {
        await DBInstance();
        const usn = req.query.usn;

        if (req.method === "GET") {
            await getTeams(usn, res);
        } else if (req.method === "DELETE") {
            return await deleteTeams(usn, res);
        } else if (req.method === "PATCH") {
            await updateTeams(usn, req, res);
        } else {
            res.status(405).json({ success: false, error: "Method Not Allowed" });
        }
    } catch (error) {
        console.error("API error in /api/v1/teams/[usn]:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}
