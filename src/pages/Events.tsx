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
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [ageMin, setAgeMin] = useState<number | "">("");
    const [ageMax, setAgeMax] = useState<number | "">("");
    const [joinedEvents, setJoinedEvents] = useState<number[]>([]);
    const [prefetchedEvents, setPrefetchedEvents] = useState<EventDto[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [showOnlyFriendsEvents, setShowOnlyFriendsEvents] = useState(false);
    const [sortOrder, setSortOrder] = useState<"alphabetical" | "date">("alphabetical");
    const [width, setWidth] = useState(window.innerWidth);
    const [allFriendEvents, setAllFriendEvents] = useState<EventDto[]>([]);

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

                await loadPublicEvents({ page: 1, reset: true, joinedIds: joined });
                setLoading(false);
            } catch (error) {
                console.error("Something went wrong:", error);
            }
        };

        fetchData();
    }, []);

    const loadPublicEvents = async ({ page: pageToLoad, reset, joinedIds }: { page: number; reset: boolean; joinedIds?: number[] }) => {
        const joinedList = joinedIds ?? joinedEvents;
        let buffer = reset ? [] : [...prefetchedEvents];
        let currentPage = pageToLoad;
        let hasPageRemaining = false;
        let lastFetchedPage = reset ? pageToLoad - 1 : page;

        while (buffer.length < PAGE_SIZE) {
            const filters = {
                ageMin: ageMin === "" ? null : ageMin,
                ageMax: ageMax === "" ? null : ageMax,
                interests: selectedInterests.length > 0 ? selectedInterests : null,
                page: currentPage,
                pageSize: PAGE_SIZE,
                sort: sortOrder,
            };

            const response = await getEvents(filters);
            const filtered = response.filter(e => !joinedList.includes(e.eventId));
            buffer = [...buffer, ...filtered];

            lastFetchedPage = currentPage;
            hasPageRemaining = response.length === PAGE_SIZE;
            currentPage += 1;

            if (!hasPageRemaining) break;
        }

        const nextChunk = buffer.slice(0, PAGE_SIZE);
        const remaining = buffer.slice(PAGE_SIZE);

        if (reset) {
            setEvents(nextChunk);
        } else {
            setEvents(prev => [...prev, ...nextChunk]);
        }

        setPrefetchedEvents(remaining);
        setHasMore(remaining.length > 0 || hasPageRemaining);
        setPage(lastFetchedPage);
    };

    const handleSearch = async () => {
        setLoading(true);
        setPage(1);
        setHasMore(true);

        if (showOnlyFriendsEvents) {
            const res = await GetFriendEvents();
            let filtered = res;

            if (sortOrder === "alphabetical") {
                filtered = filtered.sort((a: EventDto, b: EventDto) => a.title.localeCompare(b.title));
            } else if (sortOrder === "date") {
                filtered = filtered.sort((a: EventDto, b: EventDto) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            }

            setAllFriendEvents(filtered);
            setEvents(filtered.slice(0, PAGE_SIZE));
            setHasMore(filtered.length > PAGE_SIZE);
            setLoading(false);
        }
        else {
            await loadPublicEvents({ page: 1, reset: true });
            setLoading(false);
        }
    };

    const toggleJoinStatus = async (eventId: number) => {
        try {
            if (joinedEvents.includes(eventId)) {
                await LeaveEvent(eventId);
                setJoinedEvents(joinedEvents.filter((id) => id !== eventId));
                console.log("Left event with ID:", eventId);
            } else {
                await JoinEvent(eventId);
                setJoinedEvents([...joinedEvents, eventId]);
                console.log("Joined event with ID:", eventId);
            }
        }
        catch (error) {
            console.error("Error while handling event:", error);
            alert("Something went wrong, please try again later.");
        }
    }

    const loadMore = async () => {
        if (loadingMore) return;

        if (showOnlyFriendsEvents) {
            const nextPage = page + 1;
            const endIdx = nextPage * PAGE_SIZE;
            const newEvents = allFriendEvents.slice(0, endIdx);
            setEvents(newEvents);
            setHasMore(allFriendEvents.length > newEvents.length);
            setPage(nextPage);
            return;
        }

        setLoadingMore(true);
        const nextPage = page + 1;
        await loadPublicEvents({ page: nextPage, reset: false });
        setLoadingMore(false);
    };

    return (
        <div className="d-flex flex-column container">
            <div className="d-flex flex-column p-3 rounded filter-card" style={{ zIndex: 1 }}>
                <div className="d-flex flex-column gap-3 mt-2">
                    <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-end">
                        <div className="w-100 w-md-50">
                            <label className="form-label fw-semibold mb-1">Interests</label>
                            <Dropdown 
                                selectedInterests={selectedInterests}
                                onChange={setSelectedInterests}
                            />
                        </div>

                        <div className="d-flex w-100 w-md-50 gap-2 align-items-end flex-column flex-sm-row">
                            <div className="flex-grow-1 w-100">
                                <label htmlFor="minAgeFilter" className="form-label fw-semibold mb-1">Min age</label>
                                <input
                                    id="minAgeFilter"
                                    type="number"
                                    placeholder="Min age"
                                    value={ageMin}
                                    className="form-control filter-input"
                                    onChange={(e) => setAgeMin(e.target.value === "" ? "" : Number(e.target.value))}
                                    min={0}
                                    aria-label="Minimum age filter"
                                />
                            </div>

                            <div className="flex-grow-1 w-100">
                                <label htmlFor="maxAgeFilter" className="form-label fw-semibold mb-1">Max age</label>
                                <input
                                    id="maxAgeFilter"
                                    type="number"
                                    placeholder="Max age"
                                    value={ageMax}
                                    className="form-control filter-input"
                                    onChange={(e) => setAgeMax(e.target.value === "" ? "" : Number(e.target.value))}
                                    min={0}
                                    aria-label="Maximum age filter"
                                />
                            </div>
                        </div>
                    </div>

                    {selectedInterests.length > 0 && (
                        <div>
                            <strong>Selected interests:</strong>
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
                            <label htmlFor="sortDropdown" className="mb-0 fw-semibold">Sort:</label>
                            <select
                                id="sortDropdown"
                                className="form-select filter-input"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as "alphabetical" | "date")}
                                style={{ cursor: "pointer" }}
                            >
                                <option value="alphabetical">Alphabetical</option>
                                <option value="date">Date</option>
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
                                Show only friends events
                            </label>
                        </div>

                        {width > 800 && (
                            <button className="btn-orange" onClick={handleSearch}>
                                Search
                            </button>
                        ) || width < 800 && (
                            <button className="btn-orange px-2 px-lg-4 py-1 py-lg-2 w-100" onClick={handleSearch}>
                                Search
                            </button>
                        )}
                    </div>

                    {loading && <p className="mb-0">Loading...</p>}
                    {!loading && events.length === 0 && <p className="mb-0">No events found.</p>}
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
                    <button className="btn-orange" onClick={loadMore} disabled={loadingMore}>
                        {loadingMore ? "Loading..." : "Load more events"}
                    </button>
                </div>
            )}
        </div>
    );
}
