import Team from "@/utils/models/teams.model";

async function getTeams(usn, res) {
    try {
        const team = await Team.findOne({ usn: usn });
        if (!team) {
            res.status(404).json({ success: false, error: "Team not found" });
        } else {
            res.status(200).json({ success: true, data: team });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default getTeams;
