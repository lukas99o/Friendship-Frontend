import { API_BASE_URL } from "../../config";

type CreateEventParameters = {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location: string;
    isPublic: boolean;
    ageRangeMax?: number | null;
    ageRangeMin?: number | null;
    interests?: string[];
    eventPicture?: File | null;
};

export default async function CreateEvent(parameters: CreateEventParameters) {
    const formData = new FormData();
    formData.append("title", parameters.title);
    formData.append("description", parameters.description ?? "");
    formData.append("startTime", parameters.startTime);
    formData.append("endTime", parameters.endTime);
    formData.append("location", parameters.location);
    formData.append("isPublic", String(parameters.isPublic));

    if (parameters.ageRangeMax !== null && parameters.ageRangeMax !== undefined) {
        formData.append("ageRangeMax", String(parameters.ageRangeMax));
    }
    if (parameters.ageRangeMin !== null && parameters.ageRangeMin !== undefined) {
        formData.append("ageRangeMin", String(parameters.ageRangeMin));
    }

    formData.append("interests", JSON.stringify(parameters.interests ?? []));

    if (parameters.eventPicture) {
        formData.append("eventPicture", parameters.eventPicture, parameters.eventPicture.name);
    }

    const res = await fetch(`${API_BASE_URL}/api/event`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
        },
        body: formData
    });

    if (res.status === 400) {
        const message = await res.text();
        throw new Error(message);
    }
}