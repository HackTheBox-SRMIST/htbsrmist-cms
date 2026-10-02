import DBInstance from "@/utils/db";
import Event from "@/utils/models/event.models";
import mongoose from "mongoose";
import getParticipantModel from "@/utils/models/participant.models";

DBInstance();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    try {
        const { slug, participants, data: itemsData, items, list: listParam, target = "participants" } = req.body;
        let list = participants || itemsData || items || listParam;

        // If the JSON object wrapped the array in a key like { data: [...] } or { participants: [...] }
        if (!Array.isArray(list) && list && typeof list === "object") {
            const arrKey = Object.keys(list).find((k) => Array.isArray(list[k]));
            if (arrKey) {
                list = list[arrKey];
            }
        }

        if (!slug || !Array.isArray(list) || list.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Provide an event slug and a non-empty data array to import.",
            });
        }

        const rawTarget = String(target || "participants").trim().toLowerCase();
        const resolvedTarget = rawTarget.replace(/[^a-z0-9_-]/g, "_") || "participants";

        const event = await Event.findOne({ slug });
        if (!event) {
            return res.status(404).json({ success: false, error: "Event not found" });
        }

        const eventDbName = event.database || `prod_${event.slug || slug}`;
        if (!event.database) {
            event.database = eventDbName;
            await event.save().catch(() => {});
        }

        const db = mongoose.connection.useDb(eventDbName);
        const collectionName =
            (event.collection && event.collection[resolvedTarget]) || resolvedTarget;
        const TargetModel = getParticipantModel(db, collectionName);

        // Keep event.collection in sync with newly created target collections
        if (!event.collection || !event.collection[resolvedTarget]) {
            if (!event.collection || typeof event.collection !== "object") {
                event.collection = {
                    participants: "participants",
                    organizers: "organizers",
                    volunteers: "volunteers",
                };
            }
            event.collection[resolvedTarget] = collectionName;
            event.markModified("collection");
            await event.save().catch((err) => console.warn("Failed to record collection key:", err));
        }

        let ops = [];
        let skipped = 0;

        for (const rawRow of list) {
            if (!rawRow || typeof rawRow !== "object") {
                skipped++;
                continue;
            }

            // Normalize row keys to lowercase for flexible matching
            const row = {};
            Object.keys(rawRow).forEach((k) => {
                const cleanKey = k.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
                row[cleanKey] = rawRow[k];
            });

            // Extract name (supports name, Name, fullName, student_name, etc.)
            const nameVal =
                row.name ??
                row.fullname ??
                row.full_name ??
                row.student_name ??
                row.participant_name ??
                rawRow.Name ??
                rawRow["Full Name"] ??
                "";
            const name = String(nameVal).trim();

            // Extract email (supports email, Email, email_address, mail, etc.)
            const emailVal =
                row.email ??
                row.email_address ??
                row.mail ??
                rawRow.Email ??
                rawRow["Email Address"] ??
                "";
            const email = String(emailVal).trim().toLowerCase();

            if (!name || !email) {
                skipped++;
                continue;
            }

            // Extract usn (supports usn, USN, regno, registration_number, roll_no, etc.)
            const usnVal =
                row.usn ??
                row.regno ??
                row.reg_no ??
                row.registration_number ??
                row.register_no ??
                row.register_number ??
                row.rollno ??
                row.roll_no ??
                rawRow.USN ??
                rawRow.Usn ??
                "";

            // Extract dept (supports dept, Dept, department, branch, etc.)
            const deptVal =
                row.dept ??
                row.department ??
                row.branch ??
                row.dept_name ??
                row.department_name ??
                rawRow.Dept ??
                rawRow.Department ??
                "";

            // Only name and email are compulsory
            const doc = {
                name,
                email,
            };

            if (usnVal !== "" && usnVal !== undefined && usnVal !== null) {
                doc.usn = String(usnVal).trim();
            }
            if (deptVal !== "" && deptVal !== undefined && deptVal !== null) {
                doc.dept = String(deptVal).trim();
            }

            // Copy any genuine custom fields present in this row
            const standardKeys = new Set([
                "name",
                "email",
                "usn",
                "dept",
                "_id",
                "__v",
                "fullname",
                "full_name",
                "student_name",
                "participant_name",
                "email_address",
                "mail",
                "regno",
                "reg_no",
                "registration_number",
                "register_no",
                "register_number",
                "rollno",
                "roll_no",
                "department",
                "branch",
                "dept_name",
                "department_name",
            ]);

            Object.keys(row).forEach((k) => {
                if (!standardKeys.has(k)) {
                    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
                        doc[k] = typeof row[k] === "string" ? row[k].trim() : row[k];
                    }
                }
            });

            ops.push({
                updateOne: {
                    filter: { email: doc.email },
                    update: {
                        $set: doc,
                        $unset: { __v: "" },
                    },
                    upsert: true,
                },
            });
        }

        if (ops.length === 0) {
            return res.status(400).json({
                success: false,
                error: `No valid records found in JSON. Every entry must have at least a 'name' and 'email' (scanned ${list.length} rows, skipped ${skipped}).`,
            });
        }

        const result = await TargetModel.bulkWrite(ops, { ordered: false });
        const added = result.upsertedCount || 0;
        let updated = result.modifiedCount || 0;
        if (updated === 0 && result.matchedCount > 0) {
            updated = result.matchedCount;
        }

        res.status(200).json({
            success: true,
            data: {
                target: resolvedTarget,
                collection: collectionName,
                database: eventDbName,
                total: list.length,
                added,
                updated,
                skipped,
            },
        });
    } catch (error) {
        console.error("Error importing data:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "20mb",
        },
    },
};