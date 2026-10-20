import Team from "@/utils/models/teams.model";

async function updateTeams(usn, req, res) {
    try {
        const update = { ...req.body };
        // Delete immutable / metadata fields that cause MongoDB update errors
        delete update._id;
        delete update.__v;
        delete update.createdAt;
        delete update.updatedAt;
        // Do not allow modifying primary identifier USN during updates
        delete update.usn;

        if (update.index === "" || update.index === null || update.index === undefined) {
            update.index = null;
        } else {
            update.index = Number(update.index);
        }

        if (!Array.isArray(update.status) || update.status.length === 0) {
            if (update.position && update.joined) {
                update.status = [
                    { position: String(update.position).trim(), joined: Number(update.joined) }
                ];
            } else {
                update.status = [];
            }
        } else {
            update.status = update.status
                .filter((s) => s && s.position && s.joined !== "" && !isNaN(Number(s.joined)))
                .map((s) => ({
                    position: String(s.position).trim(),
                    joined: Number(s.joined)
                }));
        }

        // Validate no duplicate years in status history
        const seenYears = new Set();
        for (const s of (update.status || [])) {
            const yr = Number(s.joined);
            if (seenYears.has(yr)) {
                return res.status(400).json({
                    success: false,
                    error: `Year ${s.joined} already exists in status history. A member cannot have multiple positions for the same year.`
                });
            }
            seenYears.add(yr);
        }

        if (typeof update.isCurrent === "string") {
            update.isCurrent = update.isCurrent === "true";
        }

        const team = await Team.findOneAndUpdate({ usn: usn }, update, {
            new: true,
            runValidators: true
        });

        if (!team) {
            res.status(404).json({ success: false, error: "Team member not found" });
        } else {
            res.status(200).json({ success: true, data: team });
        }
    } catch (error) {
        console.error("Error updating team member:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}

export default updateTeams;
