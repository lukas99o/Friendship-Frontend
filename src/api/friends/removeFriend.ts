import { API_BASE_URL } from "../../config";

export async function RemoveFriend(username: string): Promise<boolean> {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        return false;
    }

    const res = await fetch(`${API_BASE_URL}/api/friendship/removefriend/${username}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    return res.ok;
}
