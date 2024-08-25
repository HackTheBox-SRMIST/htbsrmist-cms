import Team from "@/utils/models/teams.model";

async function getAllTeams(res) {
    try {
        const teams = await Team.find();
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
