import { API_BASE_URL } from "../../config";

export async function deleteProfilePicture(): Promise<boolean> {
    const token = localStorage.getItem("jwtToken");
    if (!token) return false;

    try {
        const res = await fetch(`${API_BASE_URL}/api/user/delete-profile-picture`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            console.error("Delete failed:", res.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Network or server error:", error);
        return false;
    }
}
