export default function newError(message = "Internal server error", status = 500) {
    const err = new Error(message);
    err.status = status;
    return err;
}