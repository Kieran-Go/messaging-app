import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import UserEditForm from "./User-Edit-Form";
import { deleteJson, getJson } from "../utility/fetchUtility";
import "../css/Account.css";

const token = localStorage.getItem("token");

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
    const [blockList, setBlockList] = useState([]);
    const [blockFetchError, setBlockFetchError] = useState(null);
    const [blockLoading, setBlockLoading] = useState(true);

    // ----- EFFECTS -----
    useEffect(() => {
        getBlockList();
    },[])

    // ----- FUNCTIONS -----
    // Render the form with the given mode
    const startForm = (mode) => {
        setFormMode(mode);
        setShowForm(true);
    }

    // Fetch the user's list of blocks
    const getBlockList = async () => {
        setBlockFetchError(null);
        setBlockLoading(true);
        try {
            const blocks = await getJson(
                "/blocks",
                null,
                { token }
            );
            setBlockList(blocks);
        }
        catch(err) {
            setBlockFetchError(err.message);
        }
        finally{
            setBlockLoading(false);
        }
    }

    // Unblock a user
    const unblock = async (blockedId) => {
        try{
            await deleteJson(
                `/blocks/${blockedId}`,
                null,
                { token }
            );

            // Remove blocked user from blocklist
            setBlockList(prev => prev.filter(b => b.blocked.id !== blockedId));
        }
        catch(err) {
            alert(err.message);
        }
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

            {/* Block list */}
            <div className="block-list">
                <h3>Block List:</h3>
                {blockLoading && <p>Loading block list...</p>}
                {blockFetchError && <p className="fetch-error">{blockFetchError}</p>}
                {blockList.map((b) => {
                    return(
                        <div className="block-item" key={b.id}>
                            <p>{b.blocked.username}</p>
                            <button onClick={ () => unblock(b.blocked.id) }>Unblock</button>
                        </div>
                    )
                })}
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