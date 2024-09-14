import getAllTeams from "@/utils/services/teams/getAll.teams";
import newTeams from "@/utils/services/teams/new.teams";
import DBInstance from "@/utils/db";

DBInstance();

export default async function handler(req, res) {
    if (req.method === "GET") {
        await getAllTeams(req, res);
    } else if (req.method === "POST") {
        return await newTeams(req, res);
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
