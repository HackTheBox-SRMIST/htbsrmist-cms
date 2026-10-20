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
        const { domain, position, isCurrent, year } = req.query;

        // Build base filter
        const filter = {};
        if (domain) filter.domain = domain;

        const currentYear = new Date().getFullYear();

        if (isCurrent !== undefined) {
            if (isCurrent === "true") {
                // Current member: active AND belongs to the current academic year (2026)
                filter.isCurrent = true;
                filter.$or = [
                    { "status.joined": currentYear },
                    { status: { $size: 0 }, joined: currentYear }
                ];
            } else if (isCurrent === "false") {
                filter.isCurrent = false;
            }
        }

        if (year) {
            const yrNum = Number(year);
            filter.$or = [
                { "status.joined": yrNum },
                { status: { $size: 0 }, joined: yrNum }
            ];
        }

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
