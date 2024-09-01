import Teams from "@/utils/models/teams.model";
import DBInstance from "@/utils/db";
DBInstance();

const addTeams = async(req,res)=>{
    try{
        const newTeams = new Teams(req.body);
        await newTeams.save();
        res.status(400).json({
            success:true,
            data:newTeams
        })
    }catch(e){
        res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
}

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const teams = await Teams.find();

            res.status(200).json({ success: true, data: teams });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    }
    if(req.method==="POST"){
        return await addTeams(req,res)
    }
     else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
