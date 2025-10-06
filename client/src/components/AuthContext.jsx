import { useState, useEffect, createContext } from 'react';

// Create a context for data associated with user-authentication
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // User and authLoading states
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Get token from local storage
        const token = localStorage.getItem('token');

        // If no token, stop loading and user remains null
        if(!token) {
            setAuthLoading(false);
            return;
        }

        // If token exists, validate it by calling the backend /auth route
        fetch(`${import.meta.env.VITE_SERVER_ORIGIN}/auth`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json()) // Parse JSON response
        .then(data => {
            // If backend says token is valid, update user state with user info
            if(data.valid) setUser(data.user);

            // If token is invalid, remove it from localStorage
            else {
                localStorage.removeItem('token');
            }
        })
        .catch(err => console.error(err))
        .finally(() => setAuthLoading(false));
    },[]);

    // Provide the user and loading states and the setter to children as context
    return(
        <>
            <AuthContext.Provider value={{ user, setUser, authLoading, setAuthLoading }}>
                {children}
            </AuthContext.Provider>
        </>
    );
}