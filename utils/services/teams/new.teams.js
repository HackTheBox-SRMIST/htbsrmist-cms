import Team from "@/utils/models/teams.model";

async function newTeams(req, res) {
    try {
        const body = { ...req.body };
        if (body.index === "" || body.index === null || body.index === undefined) {
            delete body.index;
        } else {
            body.index = Number(body.index);
        }
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
        body.status = body.status
            .filter((s) => s && s.position && s.joined !== "" && !isNaN(Number(s.joined)))
            .map((s) => ({
                position: String(s.position).trim(),
                joined: Number(s.joined)
            }));

        // Validate no duplicate years in status history
        const seenYears = new Set();
        for (const s of body.status) {
            const yr = Number(s.joined);
            if (seenYears.has(yr)) {
                return res.status(400).json({
                    success: false,
                    error: `Year ${s.joined} already exists in status history. A member cannot have multiple positions for the same year.`
                });
            }
            seenYears.add(yr);
        }

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
