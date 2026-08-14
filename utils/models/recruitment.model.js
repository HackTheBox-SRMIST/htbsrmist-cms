import mongoose from "mongoose";

const RECRUITMENT_DB = "htbsrmist";

const RecruitmentSchema = new mongoose.Schema({
    usn: String,
    name: String,
    email: String,
    phone: String,
    domain1: String,
    domain2: String,
    linkedin: String,
    additionalLink: String,
    resume: String,
    status: String,
    passKey: String
}, {
    collection: 'recruitment26'
});

const getRecruitmentConnection = () => {
    const existing = mongoose.connections.find(
        (conn) => conn.name === RECRUITMENT_DB
    );
    if (existing) return existing;

    return mongoose.createConnection(process.env.NEXT_PUBLIC_MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: RECRUITMENT_DB
    });
};

const recruitmentConnection = getRecruitmentConnection();

export const Recruitment =
    recruitmentConnection.models.Recruitment ||
    recruitmentConnection.model("Recruitment", RecruitmentSchema);
