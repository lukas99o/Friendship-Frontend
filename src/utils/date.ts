export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Stockholm"
    });
}
