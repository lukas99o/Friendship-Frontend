import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInterests } from "../api/interests";
import { readEvent } from "../api/events/readEvent";
import { updateEvent } from "../api/events/updateEvent";
import { formatDate } from "../utils/date";
import type { EventDto } from "../types";

export default function EditEventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [ageRangeMin, setAgeRangeMin] = useState<number | "">("");
    const [ageRangeMax, setAgeRangeMax] = useState<number | "">("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [interests, setInterests] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true);
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [existingImgUrl, setExistingImgUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getInterests().then(setInterests).catch(() => setInterests([]));
    }, []);

    useEffect(() => {
        if (!eventId) {
            setError("Invalid event ID.");
            setIsLoading(false);
            return;
        }

        const numericId = Number(eventId);
        if (Number.isNaN(numericId)) {
            setError("Invalid event ID.");
            setIsLoading(false);
            return;
        }

        readEvent(numericId)
            .then((event: EventDto) => {
                const incoming = event as EventDto & { isPublic?: boolean };
                setTitle(event.title);
                setStartTime(formatDate(event.startTime));
                setEndTime(formatDate(event.endTime));
                setLocation(event.location ?? "");
                setAgeRangeMin(event.ageRangeMin ?? "");
                setAgeRangeMax(event.ageRangeMax ?? "");
                setSelectedInterests(event.interests ?? []);
                setIsPublic(incoming.isPublic ?? true);
                setExistingImgUrl(event.img ?? null);
                setDescription(event.description ?? "");
            })
            .catch(() => {
                setError("Could not fetch the event.");
            })
            .finally(() => setIsLoading(false));
    }, [eventId]);

    const threeYearsFromToday = new Date();
    threeYearsFromToday.setFullYear(threeYearsFromToday.getFullYear() + 3);
    threeYearsFromToday.setSeconds(0, 0);
    const maxDate = threeYearsFromToday.toISOString().slice(0, 16);

    const minDate = new Date();
    minDate.setSeconds(0, 0);
    minDate.setMinutes(minDate.getMinutes() + 5);

    const pad = (n: number) => n.toString().padStart(2, '0');

    const minDateString =
        minDate.getFullYear() + "-" +
        pad(minDate.getMonth() + 1) + "-" +
        pad(minDate.getDate()) + "T" +
        pad(minDate.getHours()) + ":" +
        pad(minDate.getMinutes());

    const getEndMin = () => {
        if (!startTime) return minDateString; 

        const d = new Date(startTime);
        d.setMinutes(d.getMinutes() + 5);
        d.setSeconds(0, 0);

        const pad = (n: number) => n.toString().padStart(2, "0");

        return (
            d.getFullYear() + "-" +
            pad(d.getMonth() + 1) + "-" +
            pad(d.getDate()) + "T" +
            pad(d.getHours()) + ":" +
            pad(d.getMinutes())
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!eventId) {
            setError("Missing event ID.");
            return;
        }

        const numericId = Number(eventId);
        if (Number.isNaN(numericId)) {
            setError("Invalid event ID.");
            return;
        }

        if (new Date(endTime) <= new Date(startTime)) {
            setError("End time must be later than start time.");
            return;
        }

        if (ageRangeMin !== "" && ageRangeMax !== "" && ageRangeMin > ageRangeMax) {
            setError("Minimum age cannot be greater than maximum age.");
            return;
        }

        try {
            await updateEvent(numericId, {
                title,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                location,
                ageRangeMin: ageRangeMin === "" ? null : ageRangeMin,
                ageRangeMax: ageRangeMax === "" ? null : ageRangeMax,
                interests: selectedInterests,
                isPublic,
                eventPicture: imgFile,
                description
            });
            navigate("/my-events");
        } catch (err) {
            if (err instanceof Error)
                setError(err.message);
        }
    };

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                <div className="spinner-border" role="status" aria-label="Loading">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center container" style={{ height: "fit-content" }}>
            <div className="pb-5" style={{ width: "600px" }}>
                <button onClick={() => navigate(-1)} className="btn-orange mb-3">
                    ← Back
                </button>
                <div className="card shadow-sm w-100 container-header">
                    <div className="card-body p-4">
                        <h2 className="mb-4 text-center header">Edit event</h2>
                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">

                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="title"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <label htmlFor="title">Title</label>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            id="startTime"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            required
                                            max={maxDate}
                                            min={minDateString}
                                        />
                                        <label htmlFor="startTime">Start time</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            id="endTime"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            required
                                            max={maxDate}
                                            min={getEndMin()}
                                        />
                                        <label htmlFor="endTime">End time</label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="location"
                                    placeholder="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                                <label htmlFor="location">Location</label>
                            </div>

                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="description"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <label htmlFor="description">Description</label>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="ageMin"
                                            placeholder="Min age"
                                            value={ageRangeMin}
                                            onChange={(e) => setAgeRangeMin(Number(e.target.value))}
                                            min={18}
                                            max={100}
                                        />
                                        <label htmlFor="ageMin">Age limit (min)</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="ageMax"
                                            placeholder="Max age"
                                            value={ageRangeMax}
                                            onChange={(e) => setAgeRangeMax(Number(e.target.value))}
                                            min={18}
                                            max={100}
                                        />
                                        <label htmlFor="ageMax">Age limit (max)</label>
                                    </div>
                                </div>
                                <div className="col md-6 mt-4">
                                    <div className="form-floating">
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="img"
                                            placeholder="Choose image"
                                            onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                                            accept="image/*"
                                        />
                                        <label htmlFor="img">Upload new image</label>
                                    </div>
                                    {(imgFile || existingImgUrl) && (
                                        <div className="mt-2">
                                            {imgFile && (
                                                <div>
                                                    <small className="text-muted">Selected file: {imgFile.name}</small>
                                                </div>
                                            )}
                                            {!imgFile && existingImgUrl && (
                                                <div>
                                                    <small className="text-muted">Current image will be kept</small>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex flex-column flex-md-row justify-content-between mt-4 gap-4">
                                    <div className="dropdown flex-grow-1">
                                        <button
                                        className="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                                        type="button"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        aria-expanded={dropdownOpen}
                                        >
                                        {selectedInterests.length > 0
                                            ? `Selected (${selectedInterests.length})`
                                            : "Choose interests"}
                                        </button>

                                        <ul
                                        className={`dropdown-menu${dropdownOpen ? " show" : ""}`}
                                        style={{ maxHeight: "200px", overflowY: "auto" }}
                                        >
                                        {interests.map((interest) => (
                                            <li key={interest} className="dropdown-item">
                                            <div className="form-check">
                                                <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`interest-${interest}`}
                                                checked={selectedInterests.includes(interest)}
                                                onChange={() => toggleInterest(interest)}
                                                />
                                                <label className="form-check-label" htmlFor={`interest-${interest}`}>
                                                {interest}
                                                </label>
                                            </div>
                                            </li>
                                        ))}
                                        </ul>

                                        {selectedInterests.length > 0 && (
                                        <div className="mt-2">
                                            <strong>Selected interests:</strong>
                                            <ul className="list-inline mt-1">
                                            {selectedInterests.map((interest) => (
                                                <li
                                                key={interest}
                                                className="list-inline-item badge me-1 p-2"
                                                style={{ fontSize: "0.85rem", background: "orange" }}
                                                >
                                                {interest}
                                                </li>
                                            ))}
                                            </ul>
                                        </div>
                                        )}
                                    </div>

                                    <div className="form-check form-switch mt-2 mt-md-0">
                                        <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="isPublic"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="isPublic">
                                            Public event
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn-orange mt-0">
                                Update
                            </button>
                        </form>

                        {error && (
                            <div className="alert alert-danger mt-4" role="alert">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
