import Team from "@/utils/models/teams.model";

async function newTeams(req, res) {
    try {
        const body = { ...req.body };
        // Normalize legacy fields to new status array if needed
        if (!Array.isArray(body.status) || body.status.length === 0) {
            if (body.position && body.joined) {
                body.status = [
                    { position: body.position, joined: Number(body.joined) }
                ];
            } else {
                body.status = [];
            }
        }
        // Ensure joined numbers are numbers
        body.status = body.status.map((s) => ({
            position: String(s.position),
            joined: Number(s.joined)
        }));

        const team = new Team(body);
        await team.save();
        res.status(201).json({ success: true, data: team });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default newTeams;
