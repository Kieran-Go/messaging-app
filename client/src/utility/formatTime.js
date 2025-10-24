// Converts date string to a more readable format
export function formatTime(isoString) {
    const date = new Date(isoString);

    const options = {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    };

    return date.toLocaleString(undefined, options);
}
