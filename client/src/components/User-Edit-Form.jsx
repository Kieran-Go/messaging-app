import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { deleteJson, putJson } from "../utility/fetchUtility";
import images from "../utility/images";

export default function UserEditForm({ mode, setShowForm }) {
    // ----- CONTEXTS -----
    const { user, setUser } = useContext(AuthContext);

    // ----- STATES -----
    const [allowSubmit, setAllowSubmit] = useState(true);

    // Input states
    const [username, setUsername] = useState(user.username || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Error states
    const [usernameError, setUsernameError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState(null);
    const [newPasswordError, setNewPasswordError] = useState(null);
    const [serverError, setServerError] = useState(null);

    // ----- FUNCTIONS -----
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default submit behavior
        setServerError(null); // Reset server error

        // If in password mode, verify password confirmation
        if(mode.id === "password" && newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            return;
        }

        // If in delete mode, ask the user to confirm
        if(mode.id === "delete") {
            if(!confirm("Are you sure you want to delete your account?")) {
                return;
            }
        }

        // Attempt the request
        try {
            // Disable submission button while making request
            setAllowSubmit(false);

            // Build the body
            const body = { password: password.trim() };
            if (mode.id === "username") body.username = username.trim();
            else if (mode.id === "password") {
                body.newPassword = newPassword.trim();
                body.confirmPassword = confirmPassword.trim();
            }

            // Get token from local storage
            const token = localStorage.getItem('token');

            // Make the request
            let data = {};
            if(mode.id === "delete") { data = await deleteJson(mode.endpoint, body, { token }); }
            else { data = await putJson(mode.endpoint, body, { token }); }

            // If in username mode, update user context
            if(mode.id === "username") setUser({ ...user, username: username.trim() });

            // If in delete mode, reload the page (go back to login)
            if(mode.id === "delete") window.location.reload();

            // Close the form
            setShowForm(false);
        }
        catch(err) {
            // Display the server-side error
            setServerError(err.message);

            // Re-enable submit
            setAllowSubmit(true);
        }
    }

    // ----- RENDER -----
    return(
        <>
            {/* Black overlay */}
            <div className="overlay"></div>
            
            {/* Form */}
            <form className="edit-user-form" onSubmit={handleSubmit}>
                {/* Close form button */}
                <img className="close-btn" src={images.close} onClick={() => setShowForm(false)}/>

                {/* Form title */}
                <h1>{mode.title}</h1>
                
                {/* Username field */}
                {mode.id === "username" && 
                    <div className="form-input">
                        {usernameError && <p className='input-error'>* {usernameError}</p>}
                        <label htmlFor="username">Username:</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={2}
                            maxLength={32}
                            autoFocus
                            onInvalid={(e) => {
                                e.preventDefault();
                                e.target.setCustomValidity("Username must be 2-32 characters");
                                setUsernameError(e.target.validationMessage);
                            }}
                            onInput={(e) => {
                                e.target.setCustomValidity("");
                                setUsernameError(null);
                            }}
                        />
                    </div>
                }

                {/* Password field */}
                    <div className="form-input">
                        {passwordError && <p className='input-error'>* {passwordError}</p>}
                        <label htmlFor="password">Password:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            minLength={8}
                            maxLength={64}
                            onInvalid={(e) => {
                                e.preventDefault();
                                e.target.setCustomValidity("Password must be 8–64 characters");
                                setPasswordError(e.target.validationMessage);
                            }}
                            onInput={(e) => {
                                e.target.setCustomValidity("");
                                setPasswordError(null);
                            }}
                        />
                </div>

                {mode.id === "password" && (
                    <>
                    {/* New password field */}
                    <div className="form-input">
                        {confirmPasswordError && (
                            <p className='input-error'>* {newPasswordError}</p>
                        )}
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            required
                            minLength={8}
                            maxLength={64}
                            onInvalid={(e) => {
                                e.preventDefault();
                                e.target.setCustomValidity("Must be 8–64 characters");
                                setNewPasswordError(e.target.validationMessage);
                            }}
                            onInput={(e) => {
                                e.target.setCustomValidity("");
                                setNewPasswordError(null);
                            }}
                        />
                    </div>

                    {/* Confirm password field */}
                    <div className="form-input">
                        {confirmPasswordError && (
                            <p className='input-error'>* {confirmPasswordError}</p>
                        )}
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                            minLength={8}
                            maxLength={64}
                            onInvalid={(e) => {
                                e.preventDefault();
                                e.target.setCustomValidity("Must be 8–64 characters");
                                setConfirmPasswordError(e.target.validationMessage);
                            }}
                            onInput={(e) => {
                                e.target.setCustomValidity("");
                                setConfirmPasswordError(null);
                            }}
                        />
                    </div>
                    </>
                    
                )}

                {/* Server error message */}
                {serverError && <p className='input-error'>* {serverError}</p>}

                {/* Submit button */}
                <button type="submit" disabled={!allowSubmit}>Submit</button>
            </form>
        </>
    );
}