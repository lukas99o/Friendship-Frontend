import { useEffect, useState } from "react";
import type { EventDto } from "../types.ts";
import { getMyCreatedEvents, getMyJoinedEvents,  } from "../api/events/events.ts";
import { LeaveEvent } from "../api/events/leaveEvent.ts";
import { hostDeleteEvent } from "../api/events/deleteEvent.ts";
import { Link, useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard.tsx";

export default function MyEvents() {
    const [createdEvents, setCreatedEvents] = useState<EventDto[]>([]);
    const [joinedEvents, setJoinedEvents] = useState<EventDto[]>([]);
    const [activeView, setActiveView] = useState<"created" | "joined">("joined");
    const [width, setWidth] = useState(document.body.clientWidth);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchEvents() {
            try {
                const [joined, created, ] = await Promise.all([
                    getMyJoinedEvents(),
                    getMyCreatedEvents(),
                ]);
                setJoinedEvents(joined);
                setCreatedEvents(created);
            } catch (error) {
                console.error("Error while fetching events", error);
            } 
        }

        fetchEvents();
    }, []); 

    useEffect(() => {
        const handleResize = () => {
            setWidth(document.body.clientWidth);
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [])

    const handleLeaveEvent = (eventId: number) => {
        if (createdEvents.some(event => event.eventId === eventId)) {
            hostDeleteEvent(eventId)
                .then(() => {
                    setJoinedEvents(joinedEvents.filter(event => event.eventId !== eventId));
                    setCreatedEvents(createdEvents.filter(event => event.eventId !== eventId));
                });
        }
        else {
            LeaveEvent(eventId)
                .then(() => {
                    setJoinedEvents(joinedEvents.filter(event => event.eventId !== eventId));
                })
            .catch(error => {
                console.error("Error while leaving event", error);
                alert("Something went wrong while trying to leave the event.");
            });
        }
    };

    const renderEvents = (events: EventDto[], includeEditButton?: boolean) => (
        events.map((event) => (
            <EventCard 
            key={event.eventId} 
            event={event} 
            variant="myEvents" 
            onLeave={handleLeaveEvent} 
            edit={includeEditButton ? (eventId) => navigate(`/my-events/edit/${eventId}`) : undefined}
            />
        ))
    );

    return (
        <div className="container">
            <div className="text-center mb-2">
                <Link to="/my-events/create-event" className="btn btn-orange px-3 py-2 create-btn">
                    Create event
                </Link>
            </div>
            <ul className="nav nav-tabs justify-content-center shadow-sm rounded bg-light">
                <li className="nav-item">
                <button
                    className={`nav-link ${activeView === "joined" ? "active" : ""}`}
                    onClick={() => setActiveView("joined")}
                    style={{ color: "black" }}
                >
                    Joined
                </button>
                </li>
                <li className="nav-item">
                <button
                    className={`nav-link ${activeView === "created" ? "active" : ""}`}
                    onClick={() => setActiveView("created")}
                    style={{ color: "black" }}
                >
                    Created
                </button>
                </li>
            </ul>

            <div className="mt-3 pb-5 d-flex justify-content-center">
                <div style={{ width: width > 1399 ? "95%" : "100%" }}>
                    {activeView === "joined" && (
                        joinedEvents.length > 0 ? (
                            width > 1399 ? (
                                <div className="d-flex flex-wrap justify-content-between gap-3">{renderEvents(joinedEvents)}</div>
                            ) : (
                                <div className="d-flex flex-wrap justify-content-center gap-3">{renderEvents(joinedEvents)}</div>
                            )
                        ) : (
                            <div className="alert alert-info w-100 text-center" role="status">
                                You haven't joined any events yet.
                            </div>
                        )
                    )}
                    {activeView === "created" && (
                        createdEvents.length > 0 ? (
                            width > 1399 ? (
                                <div className="d-flex flex-wrap justify-content-between gap-3">{renderEvents(createdEvents, true)}</div>
                            ) : (
                                <div className="d-flex flex-wrap justify-content-center gap-3">{renderEvents(createdEvents, true)}</div>
                            )
                        ) : (
                            <div className="alert alert-info w-100 text-center" role="status">
                                You haven't created any events yet.
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
