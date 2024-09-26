import DBInstance from "@/utils/db";
import { Recruitment } from "@/utils/models/recruitment.model"; // Ensure this points to your model file

export default async function handler(req, res) {
    try {
        // Ensure DB connection is established
        await DBInstance();
        
        // Check if the request is a GET request
        if (req.method === "GET") {
            // Fetch all recruitment data from the collection
            const allRecruitmentData = await Recruitment.find({});

            // Respond with the fetched data
            return res.status(200).json({
                success: true,
                message: "✅ Successfully fetched all recruitment data",
                data: allRecruitmentData,
            });
        } else {
            // Respond with method not allowed if it's not a GET request
            res.status(405).json({
                success: false,
                message: "🚫 HTTP Method not Allowed",
            });
        }
    } catch (err) {
        // Handle any errors
        res.status(500).json({
            success: false,
            message: "❌ Internal Server Error",
            error: err.message,
        });
    }
}
