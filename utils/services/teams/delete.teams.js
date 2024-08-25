import Team from "@/utils/models/teams.model";

async function deleteTeams(usn, res) {
    try {
        const team = await Team.findOneAndDelete({ usn: usn });

        if (!team) {
            res.status(404).json({ success: false, error: "Team not found" });
        } else {
            res.status(200).json({ success: true, data: {} });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default deleteTeams;
