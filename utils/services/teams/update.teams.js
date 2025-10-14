import Team from "@/utils/models/teams.model";

async function updateTeams(usn, req, res) {
    try {
        const update = { ...req.body };
        if (!Array.isArray(update.status) || update.status.length === 0) {
            if (update.position && update.joined) {
                update.status = [
                    { position: update.position, joined: Number(update.joined) }
                ];
            }
        } else {
            update.status = update.status.map((s) => ({
                position: String(s.position),
                joined: Number(s.joined)
            }));
        }

        const team = await Team.findOneAndUpdate({ usn: usn }, update, {
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
