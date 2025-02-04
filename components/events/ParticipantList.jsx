import Badge from "../shared/Badge";

// @/components/events/ParticipantList.js
const ParticipantList = ({ participants, onClickParticipant }) => (
    <div className="space-y-4">
        {participants.length > 0 ? (
            participants.map((participant) => (
                <div
                    key={participant._id}
                    className="bg-light-background-light dark:bg-dark-info-background shadow-lg rounded-lg p-4 flex-col items-center justify-between cursor-pointer"
                    onClick={() => onClickParticipant(participant)}
                >
                    <div>
                        <h3 className="text-lg font-bold dark:text-dark-info-color text-light-info-color">
                            {participant.name}
                        </h3>
                        <p className="dark:text-dark-color text-light-color text-sm">
                            {participant.email}
                        </p>
                        <p className="dark:text-dark-color text-light-color text-sm">
                            {participant.usn}
                        </p>
                        <p className="dark:text-dark-color text-light-color text-sm">
                            {participant.department}
                        </p>
                    </div>
                    <div className="flex space-x-4 mt-2">
                        <Badge
                            status={`RSVP: ${
                                participant.rsvp ? "Yes" : "No"
                            }`}
                            variant={
                                participant.rsvp ? "success" : "error"
                            }
                        />
                        <Badge
                            status={`Check-in: ${
                                participant.checkin ? "Yes" : "No"
                            }`}
                            variant={participant.checkin ? "success" : "error"}
                        />
                        <Badge
                            status={`Snacks: ${
                                participant.snacks ? "Yes" : "No"
                            }`}
                            variant={participant.snacks ? "success" : "error"}
                        />
                    </div>
                </div>
            ))
        ) : (
            <div className="flex justify-center items-center col-span-full">
            <div className="dark:bg-dark-error-background bg-light-error-background py-6 px-10 rounded-xl">
                <p className="dark:text-dark-error-color text-light-error-color text-center">
                No participants
                </p>
            </div>
        </div>
        )}
    </div>
);

export default ParticipantList;
