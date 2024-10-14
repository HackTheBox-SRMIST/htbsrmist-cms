// @/components/events/EventInfo.js
const EventInfo = ({ event }) => (
  <div>
    <h1 className="text-3xl font-bold text-center mb-8 dark:text-dark-accent text-light-color">
      {event.event_name}
    </h1>
    <h3 className="text-xl font-bold text-center mb-8 dark:text-dark-accent text-light-color">
      {event.venue}
    </h3>
    {/* <p className="text-lg text-center mb-6">{event.event_description}</p> */}
  </div>
);

export default EventInfo;
