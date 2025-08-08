import mongoose from 'mongoose';

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
    collection: 'recruitment25'  // Explicitly specify the collection name
});

export const Recruitment = mongoose.models.Recruitment || mongoose.model('Recruitment', RecruitmentSchema);
