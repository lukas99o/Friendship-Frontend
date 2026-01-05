import { useEffect, useState } from "react";
import { getEvents } from "../api/events/events.ts";
import { JoinEvent } from "../api/events/joinEvent.ts";
import { LeaveEvent } from "../api/events/leaveEvent.ts";
import { GetEventParticipantStatus } from "../api/events/participantStatus.ts";
import { GetFriendEvents } from "../api/events/friendEvents.ts";
import EventCard from "../components/EventCard";
import Dropdown from "../components/Dropdown";
import type { EventDto } from "../types.ts";

export default function Events() {
    const [events, setEvents] = useState<EventDto[]>([]);
    const [allEvents, setAllEvents] = useState<EventDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [ageMin, setAgeMin] = useState<number | "">("");
    const [ageMax, setAgeMax] = useState<number | "">("");
    const [joinedEvents, setJoinedEvents] = useState<number[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [showOnlyFriendsEvents, setShowOnlyFriendsEvents] = useState(false);
    const [alphabeticalOrder, setAlphabeticalOrder] = useState(false);
    const [dateOrder, setDateOrder] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);
    const [currentPage, setCurrentPage] = useState(1);
    const EVENTS_PER_PAGE = 10;

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const joined = await GetEventParticipantStatus();
                setJoinedEvents(joined);

                const allEvents = await getEvents({ ageMin: null, ageMax: null, interests: null });
                const filteredEvents = allEvents.filter(e => !joined.includes(e.eventId));
                const sorted = filteredEvents.sort((a, b) => a.title.localeCompare(b.title));

                setAllEvents(sorted);
                setEvents(sorted.slice(0, EVENTS_PER_PAGE));
                setAlphabeticalOrder(true);
                setCurrentPage(1);
                setLoading(false);
            } catch (error) {
                console.error("Något gick fel:", error);
            }
        };

        fetchData();
    }, []);


    const handleSearch = () => {
        setLoading(true);
        setCurrentPage(1);

        if (showOnlyFriendsEvents) {
            GetFriendEvents().then((res) => {
                setAllEvents(res);
                setEvents(res.slice(0, EVENTS_PER_PAGE));
                setLoading(false);
            });
        }
        else {
            const filters = {
                ageMin: ageMin === "" ? null : ageMin,
                ageMax: ageMax === "" ? null : ageMax,
                interests: selectedInterests.length > 0 ? selectedInterests : null,
            };

            getEvents(filters).then((res) => {
                let filtered = res.filter(e => !joinedEvents.includes(e.eventId));

                if (alphabeticalOrder) {
                    filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
                } else if (dateOrder) {
                    filtered = filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                }

                setAllEvents(filtered);
                setEvents(filtered.slice(0, EVENTS_PER_PAGE));
                setLoading(false);
            });
        }
    };

    const toggleJoinStatus = async (eventId: number) => {
        try {
            if (joinedEvents.includes(eventId)) {
                await LeaveEvent(eventId);
                setJoinedEvents(joinedEvents.filter((id) => id !== eventId));
                console.log("Lämnat evenemang med ID:", eventId);
            } else {
                await JoinEvent(eventId);
                setJoinedEvents([...joinedEvents, eventId]);
                console.log("Gått med i evenemang med ID:", eventId);
            }
        }
        catch (error) {
            console.error("Fel vid hantering av evenemang:", error);
            alert("Något gick fel, försök igen senare.");
        }
    }

    const loadMore = () => {
        const nextPage = currentPage + 1;
        const startIdx = nextPage * EVENTS_PER_PAGE;
        const endIdx = startIdx + EVENTS_PER_PAGE;
        const newEvents = allEvents.slice(0, endIdx);
        setEvents(newEvents);
        setCurrentPage(nextPage);
    };

    const hasMore = events.length < allEvents.length;

    return (
        <div className="d-flex flex-column container">
            <div className="d-flex flex-column p-3 rounded filter-card" style={{ zIndex: 1 }}>
                <div className="d-flex flex-column gap-3 mt-2">
                    <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-end">
                        <div className="w-100 w-md-50">
                            <label className="form-label fw-semibold mb-1">Intressen</label>
                            <Dropdown 
                                selectedInterests={selectedInterests}
                                onChange={setSelectedInterests}
                            />
                        </div>

                        <div className="d-flex w-100 w-md-50 gap-2 align-items-end flex-column flex-sm-row">
                            <div className="flex-grow-1 w-100">
                                <label className="form-label fw-semibold mb-1">Min ålder</label>
                                <input
                                    type="number"
                                    placeholder="Min ålder"
                                    value={ageMin}
                                    className="form-control filter-input"
                                    onChange={(e) => setAgeMin(e.target.value === "" ? "" : Number(e.target.value))}
                                    min={0}
                                />
                            </div>

                            <div className="flex-grow-1 w-100">
                                <label className="form-label fw-semibold mb-1">Max ålder</label>
                                <input
                                    type="number"
                                    placeholder="Max ålder"
                                    value={ageMax}
                                    className="form-control filter-input"
                                    onChange={(e) => setAgeMax(e.target.value === "" ? "" : Number(e.target.value))}
                                    min={0}
                                />
                            </div>
                        </div>
                    </div>

                    {selectedInterests.length > 0 && (
                        <div>
                            <strong>Valda intressen:</strong>
                            <div className="mt-2 d-flex flex-wrap gap-2">
                                {selectedInterests.map((interest) => (
                                    <span key={interest} className="badge filter-chip text-dark">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center filter-actions">
                        <div className="d-flex align-items-center gap-2">
                            <label htmlFor="sortDropdown" className="mb-0 fw-semibold">Sortera:</label>
                            <select
                                id="sortDropdown"
                                className="form-select filter-input"
                                value={alphabeticalOrder ? "alphabetical" : dateOrder ? "date" : ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setAlphabeticalOrder(value === "alphabetical");
                                    setDateOrder(value === "date");
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <option value="alphabetical">Alfabetiskt</option>
                                <option value="date">Datum</option>
                            </select>
                        </div>

                        <div className="form-check d-flex align-items-center">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="friendsEventsOnly"
                                onChange={(e) => setShowOnlyFriendsEvents(e.target.checked)}
                                style={{ border: "1px solid #888"}}
                            />
                            <label className="form-check-label ms-2" htmlFor="friendsEventsOnly">
                                Visa endast vänners evenemang
                            </label>
                        </div>

                        {width > 800 && (
                            <button className="btn-orange" onClick={handleSearch}>
                                Sök
                            </button>
                        ) || width < 800 && (
                            <button className="btn-orange px-2 px-lg-4 py-1 py-lg-2 w-100" onClick={handleSearch}>
                                Sök
                            </button>
                        )}
                    </div>

                    {loading && <p className="mb-0">Laddar...</p>}
                    {!loading && events.length === 0 && <p className="mb-0">Inga evenemang hittades.</p>}
                </div>
            </div>
            
            <div className="d-flex flex-wrap justify-content-center gap-4 mt-4" style={{ paddingBottom: "40px" }}>
                {events.map((e) => (
                <EventCard
                    key={e.eventId}
                    event={e}
                    isJoined={joinedEvents.includes(e.eventId)}
                    onToggleJoin={toggleJoinStatus}
                />
                ))}
            </div>

            {hasMore && (
                <div className="d-flex justify-content-center pb-5">
                    <button className="btn-orange" onClick={loadMore}>
                        Ladda fler evenemang
                    </button>
                </div>
            )}
        </div>
    );
}
