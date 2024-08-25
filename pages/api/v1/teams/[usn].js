import getTeams from "@/utils/services/teams/get.teams";
import updateTeams from "@/utils/services/teams/update.teams";
import deleteTeams from "@/utils/services/teams/delete.teams";
import DBInstance from "@/utils/db";

DBInstance();

export default async function handler(req, res) {
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
}
