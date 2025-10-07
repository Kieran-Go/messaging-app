import { useEffect, useState } from "react";
import '../css/Login.css';
import { postJson } from "../utility/fetchUtility";

// Mode objects for conditional element rendering
const loginMode = {
    isLogin: true,
    documentTitle: "Login - ChatBox",
    formMessage: "Log in to ChatBox",
    toggleMessage: "Don't have an account? Sign Up",
    submitMessage: "Log In",
    endpoint: "/auth/login"
};
const signupMode = {
    isLogin: false,
    documentTitle: "Signup - ChatBox",
    formMessage: "Sign up for Chatbox",
    toggleMessage: "Have an account? Log In",
    submitMessage: "Sign Up",
    endpoint: "/auth/signup"
};

export default function Login() {
    // ----- STATES -----
    // Active mode (Login/Signup)
    const [mode, setMode] = useState(loginMode);
    const [allowSubmit, setAllowSubmit] = useState(true);

    // Input states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Error states
    const [usernameError, setUsernameError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState(null);
    const [serverError, setServerError] = useState(null);

    // ----- EFFECTS -----
    // On mode change
    useEffect(() => {
        // Update document title
        document.title = mode.documentTitle;

        // Reset input values and errors
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setUsernameError(null);
        setPasswordError(null)
        setConfirmPasswordError(null);
        setServerError(null);
    },[mode])

    // ----- FUNCTIONS -----
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default submit behavior
        setServerError(null); // Reset server error

        // If in signup mode, verify password confirmation
        if(!mode.isLogin && password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            return;
        }

        // Attempt login or signup with POST req
        try {
            // Disable submission button while making request
            setAllowSubmit(false);

            // Build the body
            const body = { username: username.trim(), password: password.trim() };
            if(!mode.isLogin) body.confirmPassword = confirmPassword.trim();

            // Post request
            const data = await postJson(mode.endpoint, body, {});

            // Store token
            localStorage.setItem('token', data.token);

            // Reload page
            window.location.reload();
        }
        catch(err) {
            // Display the server-side error
            setServerError(err.data?.message || err.data?.error || "Something went wrong");

            // Re-enable submit
            setAllowSubmit(true);
        }
    }

    // ----- RENDER -----
    return(
        <>
            {/* Header */}
            <div className="login-header">
                <h1>Welcome to ChatBox!</h1>
            </div>

            {/* Form container */}
            <div className="auth-form">
                <h1>{mode.formMessage}</h1>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Username field */}
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
                    

                    {/* Confirm Password field (only in signup mode) */}
                    {!mode.isLogin && (
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
                    )}

                    {/* Server error message */}
                    {serverError && <p className='input-error'>* {serverError}</p>}

                    {/* Submit button */}
                    <button type="submit" disabled={!allowSubmit}>{mode.submitMessage}</button>
                </form>

                {/* Mode toggle */}
                <p className="mode-toggler" onClick={() => {if(allowSubmit) setMode(mode.isLogin ? signupMode : loginMode)}}>
                    {mode.toggleMessage}
                </p>
            </div>
        </>
    );
}