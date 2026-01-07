import React, { useState } from "react";
import CreateEvent from "../api/events/createEvent";
import { getInterests } from "../api/interests";
import { useNavigate } from "react-router-dom";

export default function CreateEventPage() {
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
    const navigate = useNavigate();

    React.useEffect(() => {
        getInterests().then(setInterests).catch(() => setInterests([]));
    }, []);

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

        if (new Date(endTime) <= new Date(startTime)) {
            setError("Sluttid måste vara senare än starttid.");
            return;
        }

        if (ageRangeMin !== "" && ageRangeMax !== "" && ageRangeMin > ageRangeMax) {
            setError("Minålder kan inte vara större än maxålder.");
            return;
        }

        try {
            await CreateEvent({
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
    }

    return (
        <div className="d-flex justify-content-center container" style={{ height: "fit-content" }}>
            <div className="pb-5" style={{ width: "600px" }}>
                <button onClick={() => navigate(-1)} className="btn-orange mb-3">
                    ← Tillbaka
                </button>
                <div className="card shadow-sm w-100 container-header">
                    <div className="card-body p-4">
                        <h2 className="mb-4 text-center header">Skapa Evenemang</h2>
                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">

                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="title"
                                    placeholder="Titel"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <label htmlFor="title">Titel</label>
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
                                        <label htmlFor="startTime">Starttid</label>
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
                                        <label htmlFor="endTime">Sluttid</label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="location"
                                    placeholder="Plats"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                                <label htmlFor="location">Plats</label>
                            </div>

                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="description"
                                    placeholder="Beskrivning"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <label htmlFor="description">Beskrivning</label>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="ageMin"
                                            placeholder="Minålder"
                                            value={ageRangeMin}
                                            onChange={(e) => setAgeRangeMin(Number(e.target.value))}
                                            min={18}
                                            max={100}
                                        />
                                        <label htmlFor="ageMin">Åldersgräns Min</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="ageMax"
                                            placeholder="Maxålder"
                                            value={ageRangeMax}
                                            onChange={(e) => setAgeRangeMax(Number(e.target.value))}
                                            min={18}
                                            max={100}
                                        />
                                        <label htmlFor="ageMax">Åldersgräns Max</label>
                                    </div>
                                </div>
                                <div className="col md-6 mt-4">
                                    <div className="form-floating">
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="img"
                                            placeholder="Välj bild"
                                            onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                                            accept="image/*"
                                        />
                                        <label htmlFor="img">Ladda upp bild</label>
                                    </div>
                                    {imgFile && (
                                        <div className="mt-2">
                                            <small className="text-muted">Vald fil: {imgFile.name}</small>
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
                                            ? `Valda (${selectedInterests.length})`
                                            : "Välj intressen"}
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
                                            <strong>Valda intressen:</strong>
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
                                            Offentligt evenemang
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn-orange mt-0">
                                Skapa
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
