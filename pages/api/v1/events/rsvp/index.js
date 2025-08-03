import mongoose from "mongoose";
import DBInstance from "@/utils/db";
import Event from "@/utils/models/event.models";
import getParticipantModel from "@/utils/models/participant.models";
import { generateQRCode } from "@/utils/email/qrcodeGenerator";
import { sendEmailWithAttachment } from "@/utils/email/emailSender";
import fs from "fs";
import path from "path";

DBInstance();

export default async function handler(req, res) {
    const { email, slug } = req.query;
    const { method } = req;

    if (method === "GET") {
        try {
            const event = await Event.findOne({ slug });

            if (!event) {
                return res
                    .status(404)
                    .json({ success: false, error: "Event not found" });
            }

            const { database, collection, rsvpLimit } = event;
            const db = mongoose.connection.useDb(database);

            const Participant = getParticipantModel(
                db,
                collection.participants
            );

            const rsvpCount = await Participant.countDocuments({ rsvp: true });

            if (rsvpCount >= rsvpLimit) {
                return res.status(200).send(`
    <html>
        <head>
            <title>RSVP Limit Reached</title>
            <style>
                body {
                    background-color: var(--background-normal);
                    color: var(--color);
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                }
                h1 {
                    color: var(--error-color);
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }
                p {
                    font-size: 1rem;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }
                strong {
                    color: var(--accent);
                }
                .container {
                    background-color: var(--background-light);
                    border: 1px solid var(--background-dark);
                    border-radius: 8px;
                    padding: 20px;
                    max-width: 600px;
                    margin: 50px auto;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>All Seats Are Full</h1>
                <p>We have reached the maximum number of RSVPs for the event: <strong>${event.event_name}</strong>.</p>
                <p>Please keep an eye on our social media for updates if more seats are released.</p>
            </div>
        </body>
    </html>
                `);
            }

            const existingParticipant = await Participant.findOne({ email });
            if (!existingParticipant) {
                return res
                    .status(404)
                    .json({ success: false, error: "Participant not found." });
            }

            if (existingParticipant.rsvp) {
                return res.status(200).send(`
    <html>
        <head>
            <title>RSVP Already Confirmed</title>
            <style>
                body {
                    background-color: var(--background-normal);
                    color: var(--color);
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                }
                h1 {
                    color: var(--accent);
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }
                p {
                    font-size: 1rem;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }
                strong {
                    color: var(--success-color);
                }
                a {
                    color: var(--info-color);
                    text-decoration: none;
                    font-weight: bold;
                }
                a:hover {
                    text-decoration: underline;
                }
                .container {
                    background-color: var(--background-light);
                    border: 1px solid var(--background-dark);
                    border-radius: 8px;
                    padding: 20px;
                    max-width: 600px;
                    margin: 50px auto;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>RSVP Already Confirmed</h1>
                <p>You have already RSVPd for the event: <strong>${event.event_name}</strong>.</p>
                <p>If you need to make changes or have questions, please contact us at <a href="mailto:community@htbchennai.in">community@htbchennai.in</a>.</p>
            </div>
        </body>
    </html>
                `);
            }

            const updatedParticipant = await Participant.findOneAndUpdate(
                { email },
                { rsvp: true },
                { new: true }
            );

            const qrCodeData = JSON.stringify({
                slug: event.slug,
                email: updatedParticipant.email
            });
            const qrCodeImage = await generateQRCode(qrCodeData);

            const emailTemplatePath = path.resolve("utils/email/ticket.html");
            const emailBodyTemplate = fs.readFileSync(
                emailTemplatePath,
                "utf-8"
            );

            const emailBody = emailBodyTemplate
                .replaceAll("{{name}}", updatedParticipant.name)
                .replaceAll("{{email}}", updatedParticipant.email)
                .replaceAll("{{phn}}", updatedParticipant.phn)
                .replaceAll("{{event}}", event.event_name)
                .replaceAll("{{department}}", updatedParticipant.dept)
                .replaceAll("{{registrationNumber}}", updatedParticipant.usn)
                .replaceAll("{{event_description}}", event.event_description)
                .replaceAll("{{date}}", event.event_date)
                .replaceAll("{{venue}}", event.venue)
                .replaceAll("{{prerequisites}}", event.prerequisites)
                .replaceAll("{{slug}}", event.slug);

            await sendEmailWithAttachment(
                email,
                `Event Ticket | ${event.event_name} | HackTheBox SRMIST `,
                emailBody,
                qrCodeImage,
                "event-ticket.png"
            );

            res.status(200).send(`
    <html>
        <head>
            <title>RSVP Confirmation</title>
            <style>
                body {
                    background-color: var(--background-normal);
                    color: var(--color);
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                }
                h1 {
                    color: var(--accent);
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }
                p {
                    font-size: 1rem;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }
                .container {
                    background-color: var(--background-light);
                    border: 1px solid var(--background-dark);
                    border-radius: 8px;
                    padding: 20px;
                    max-width: 600px;
                    margin: 50px auto;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .highlight {
                    color: var(--success-color);
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Thank you for RSVPing!</h1>
                <p>Your RSVP has been confirmed for the event: <span class="highlight">${event.event_name}</span>.</p>
                <p>Please check your email for the event ticket QR code.</p>
            </div>
        </body>
    </html>
            `);
        } catch (error) {
            console.error("Error updating participant:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    } else {
        res.status(405).json({ success: false, error: "Method Not Allowed" });
    }
}
