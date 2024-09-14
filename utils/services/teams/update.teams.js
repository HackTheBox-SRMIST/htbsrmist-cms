import Team from "@/utils/models/teams.model";

async function updateTeams(usn, req, res) {
    try {
        const team = await Team.findOneAndUpdate({ usn: usn }, req.body, {
            new: true,
            runValidators: true
        });

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

export default updateTeams;
