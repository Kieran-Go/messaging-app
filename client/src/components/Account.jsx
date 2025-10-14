import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import UserEditForm from "./User-Edit-Form";
import "../css/Account.css";

const formModes = {
    username: { id: "username", title: "Edit Username", endpoint: "/users/username" },
    password: { id: "password", title: "Edit Password", endpoint: "/users/password" },
    delete: { id: "delete", title: "Delete Account", endpoint: "/users" },
}

export default function Account() {
    // ----- CONTEXTS -----
    const { user } = useContext(AuthContext);

    // ----- STATES -----
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState(formModes.username);

    // ----- FUNCTIONS -----
    const startForm = (mode) => {
        setFormMode(mode);
        setShowForm(true);
    }

    // ----- RENDER -----
    return(
        <section className="account-page-wrapper">
            {/* Component title */}
            <h1>Account Settings</h1>

            {/* Cards for editable user info */}
            <div className="edit-card">
                <p><span>Username:</span> {user.username}</p>
                <button onClick={() => startForm(formModes.username)}>Edit</button>
            </div>
            <div className="edit-card">
                <p><span>Password:</span></p>
                <button onClick={() => startForm(formModes.password)}>Edit</button>
            </div>

            {/* Delete account button */}
            <button className="delete-btn" onClick={() => startForm(formModes.delete)}>
                Delete Account
            </button>

            {/* Show the edit form */}
            {showForm && <UserEditForm mode={formMode} setShowForm={setShowForm}/>}
        </section>
    );
}