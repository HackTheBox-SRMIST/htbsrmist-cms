import Team from "@/utils/models/teams.model";

async function newTeams(req, res) {
    try {
        const team = new Team(req.body);
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
