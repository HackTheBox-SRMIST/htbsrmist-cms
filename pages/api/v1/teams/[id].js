import Teams  from "@/utils/models/teams.model";
import DBInstance from "@/utils/db";

DBInstance();
const getTeams = async(slug,res)=>{
    try{
        const teams = Teams.findOne({slug:slug});
        if(!teams){
            res.status(404)
            .json({ success: false, error: "Event not found" });
        }
        return res.status(200).json({success:true,data:teams})
    }catch(e){
        console.log(error)
        res.status(400).json({
            success:false , error:"Internal Server Error"
        })
    }
}
const deleteTeams = async (slug,res)=>{
    try{
        const teams = await Teams.findOne({slug:slug});
        if(!teams){
            res.status(400).json({success:false , error:"Data Not found"})
        }
        const deleteId = await Teams.findOneAndDelete({slug:slug})
        console.log("delete id = "+deleteId);
        return res.status(200).json({success:true , data:teams})
    }catch(e){
        res.status(400).json({success:false, error:"Internal Server Error"})
    }
}
const updateTeams = async(slug,req,res)=>{
    try{
        const team = Teams.findOne({slug:slug});
        if(!team){
            res.status(400).json({success:false , error:"Data Not found"})
        }
        const teamsId = await Teams.findOneAndUpdate({slug:slug},req.body,{new:true});
        if(!teamsId){
            res.status(400).json({ success: false, error: "user not found" });
        }
        return res.status(200).json({success:true , data:teamsId});
    }catch(e){
        res.status(400).json({success:false , error:"Internal Server Error"})
    }
}
export default async function handler(req, res) {
    const slug = req.query.id;

    if (req.method === "GET") {
        await getTeams(slug, res);
    } else if (req.method === "DELETE") {
        return await deleteTeams(slug, res);
    } else if (req.method === "PATCH") {
        await updateTeams(slug, req, res);
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}