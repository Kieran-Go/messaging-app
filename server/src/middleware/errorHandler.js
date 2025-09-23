export default function errorHandler(err, req, res, next) {
    // Log error to console
    console.error("ERROR: " + err);

    // For validation errors
    if (err.errors) {
        return res.status(err.status || 400).json({ errors: err.errors });
    }

    // For regular errors with messages
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
}