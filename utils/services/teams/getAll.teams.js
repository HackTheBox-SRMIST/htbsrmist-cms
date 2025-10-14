import Team from "@/utils/models/teams.model";

// Helper to compute latest status entry (by joined year)
function latestStatus(team) {
    if (Array.isArray(team.status) && team.status.length > 0) {
        return team.status.reduce(
            (acc, s) =>
                !acc || (s?.joined ?? 0) > (acc?.joined ?? 0) ? s : acc,
            null
        );
    }
    // fallback to legacy fields
    if (team.position || team.joined) {
        return { position: team.position, joined: team.joined };
    }
    return null;
}

async function getAllTeams(req, res) {
    try {
        const { domain, position, isCurrent } = req.query;

        // Build base filter (domain and isCurrent are top-level)
        const filter = {};
        if (domain) filter.domain = domain;
        if (isCurrent !== undefined) filter.isCurrent = isCurrent === "true";

        // Fetch matching documents first, then filter by position using latest status
        const teams = await Team.find(filter);

        const filtered = position
            ? teams.filter(
                  (t) => (latestStatus(t)?.position || "") === position
              )
            : teams;

        // Sort by index for stable display
        const sortedTeams = filtered.sort(
            (a, b) => (a.index ?? 0) - (b.index ?? 0)
        );

        res.status(200).json({ success: true, data: sortedTeams });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default getAllTeams;
