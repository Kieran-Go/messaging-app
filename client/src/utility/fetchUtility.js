// Get server origin from .env
const origin = import.meta.env.VITE_SERVER_ORIGIN;

// General purpose function for making HTTP requests to the server
export async function request(endpoint, { method = "GET", body, token, headers = {} } = {}) {
    // Build req
    const res = await fetch(`${origin}${endpoint}`, {
        method, // The HTTP method (GET/POST/PUT/DELETE)
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}), // Authorization
            ...headers, // Provided headers
        },
        // If there is a body: stringify it
        body: body ? JSON.stringify(body) : undefined,
    });

    // Parse response as JSON or set as null if parsing fails
    const data = await res.json().catch(() => null);

    // Throw error is response is not ok
    if (!res.ok) throw { status: res.status, data };

    // Return parsed JSON data
    return data;
}

// HTTP wrappers
export const getJson = (endpoint, options) => request(endpoint, { method: "GET", ...options });
export const postJson = (endpoint, body, options) => request(endpoint, { method: "POST", body, ...options });
export const putJson = (endpoint, body, options) => request(endpoint, { method: "PUT", body, ...options });
export const deleteJson = (endpoint, options) => request(endpoint, { method: "DELETE", ...options });