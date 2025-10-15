import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import images from "../utility/images.js";
import "../css/Friends.css";

export default function Friends() {
    // ----- CONTEXTS -----
    const { user } = useContext(AuthContext);

    // ----- STATES -----
    const [searchFriends, setSearchFriends] = useState("");
    const [searchUsers, setSearchUsers] = useState("");
    const [friendsList, setFriendsList] = useState(null);
    const [usersList, setUsersList] = useState(null);

    // ----- FUNCTIONS -----
    // Search for user's current friends
    const handleSearchFriends = async () => {

    }

    // Search all users for new friends
    const handleSearchUsers = async () => {

    }

    // ----- RENDER -----
    return(
        <section className="friends-page-wrapper">
            {/* Friends column */}
            <div className="column">
                {/* Search bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        value={searchFriends}
                        placeholder="Search friends..."
                        onChange={(e) => setSearchFriends(e.target.value)}
                    />
                    <img src={images.search} onClick={() => handleSearchFriends()}></img>
                </div>

                {/* Column title */}
                <div className="column-title">
                    <h3>Friends List</h3>
                </div>
            </div>

            {/* Users column */}
            <div className="column">
                {/* Search bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        value={searchUsers}
                        placeholder="Search users..."
                        onChange={(e) => setSearchUsers(e.target.value)}
                    />
                    <img src={images.search} onClick={() => handleSearchUsers()}></img>
                </div>

                {/* Column title */}
                <div className="column-title">
                    <h3>Find New Friends</h3>
                </div>
            </div>
        </section>
    );
}