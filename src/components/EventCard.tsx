import type { EventDto } from "../types.ts";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/date";
import { API_BASE_URL } from "../config.ts";

interface EventCardProps {
  event: EventDto;
  isJoined?: boolean; 
  onToggleJoin?: (eventId: number) => void;
  onLeave?: (eventId: number) => void; 
  edit?: (eventId: number) => void;
  variant?: "default" | "myEvents";
}

export default function EventCard({ 
  event, 
  isJoined, 
  onToggleJoin, 
  onLeave, 
  edit,
  variant = "default" 
}: EventCardProps) {
  return (
    <div className="card shadow-sm border-0 overflow-hidden rounded" style={{ width: "600px" }}>
      {event.img && (
        <div style={{ height: "300px", overflow: "hidden" }}>
          <img
            src={`${API_BASE_URL}${event.img}`}
            alt={event.title}
            className="w-100"
            style={{
              objectFit: "cover",
              height: "100%",
              width: "100%"
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== event.img) {
              target.src = event.img;
            }
          }}
          />
        </div>
      )}
      
      <div className="card-body d-flex flex-column justify-content-between" style={{ backgroundColor: "#fdfdfd" }}>
        <div>
          <h5 className="card-title">{event.title}</h5>
          <p className="card-text text-muted mb-1">{formatDate(event.startTime)} – {formatDate(event.endTime)}</p>
          {event.location && <p className="card-text mb-1">📍 {event.location}</p>}
          {(event.ageRangeMin || event.ageRangeMax) && (
            <p className="card-text mb-1">🎂 Ålder: {event.ageRangeMin} - {event.ageRangeMax}</p>
          )}
          {event.interests && event.interests.length > 0 && (
            <p className="card-text mb-2">🎯 Intressen: {event.interests.join(", ")}</p>
          )}
        </div>

        <div className="d-flex gap-2">
          <Link to={`/more-info/${event.eventId}`} className="btn mt-2 btn-outline-info w-100">
            Mer Info
          </Link>

          {variant === "default" && onToggleJoin && (
            <button
              className={`btn mt-2 ${isJoined ? "btn-outline-danger" : "btn-outline-success"} w-100`}
              onClick={() => onToggleJoin(event.eventId)}
            >
              {isJoined ? "Lämna" : "Gå med"}
            </button>
          )}

          {variant === "myEvents" && onLeave && (
            <button
              className="btn mt-2 btn-outline-danger w-100"
              onClick={() => onLeave(event.eventId)}
            >
              Lämna
            </button>
          )}

          {variant === "myEvents" && edit && (
            <button
              className="btn mt-2 btn-outline-warning w-100"
              onClick={() => edit(event.eventId)}
            >
              Redigera
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
