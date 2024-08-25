import Team from "@/utils/models/teams.model";

async function getAllTeams(req, res) {
    try {
        const { domain, position, isCurrent } = req.query;
        const filter = {};

        if (domain) {
            filter.domain = domain;
        }

        if (position) {
            filter.position = position;
        }

        if (isCurrent !== undefined) {
            filter.isCurrent = isCurrent === "true";
        }

        const teams = await Team.find(filter);
        res.status(200).json({ success: true, data: teams });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export default getAllTeams;
