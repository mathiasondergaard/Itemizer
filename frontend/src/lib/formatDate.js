
// Converts date to local time zone.
export const formatDateString = (dateString) => {
    const now = new Date(dateString);
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const dateLocal = new Date(now.getTime() - offsetMs);
    const date = dateLocal.toISOString().slice(0, 16).replace(/-/g, "/").replace("T", " ");
    return `${date.slice(8, 10)}/${date.slice(5, 7)}-${date.slice(0, 4)} ${date.slice(11, 16)}`;
};