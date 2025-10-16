import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import images from "../utility/images.js";
import { getJson, postJson, putJson, deleteJson } from "../utility/fetchUtility.js";
import "../css/Friends.css";

// Get token from local storage
const token = localStorage.getItem('token');

// Object to decide which friends list to show
const modes = { accepted: 0, requests: 1 };

export default function Friends() {
    // ----- CONTEXTS -----
    const { user } = useContext(AuthContext);

    // ----- STATES -----
    const [searchFriends, setSearchFriends] = useState("");
    const [searchUsers, setSearchUsers] = useState("");
    const [friendsList, setFriendsList] = useState(null);
    const [filteredFriends, setFilteredFriends] = useState(null);
    const [usersList, setUsersList] = useState(null);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [mode, setMode] = useState(modes.accepted);

    // Error message states
    const [friendsListError, setFriendsListError] = useState(null);
    const [usersListError, setUsersListError] = useState(null);

    // ----- EFFECTS -----
    // On first mount
    useEffect(() => {
        // Fetch user's friends
        const fetchFriends = async () => {
            try{
                const friends = await getJson("/friendships", null, { token });
                // Sort friends into different categories
                const accepted = [];
                const sent = [];
                const received = [];
                for(let i = 0; i < friends.length; i++) {
                    const friend = friends[i];
                    if(friend.accepted) accepted.push(friend);
                    else {
                        if(friend.isRequester) sent.push(friend);
                        else received.push(friend);
                    }
                }
                setFriendsList({ accepted, sent, received  });
                setFilteredFriends(mode === modes.accepted ? accepted : [...sent, ...received]);
            }
            catch (err) {
                setFriendsListError(err.data?.message || err.data?.error ||
                    "Something went wrong while fetching your friends list. Try again later!");
            }
            finally { setLoadingFriends(false) }
        }
        fetchFriends();
    },[]);

    // Update filtered friends whenever searchFriends or friendsList changes
    useEffect(() => {
        if (!friendsList) return; // nothing to filter yet

        // Filter accepted friends by username
        if(mode === modes.accepted) {
            const filtered = friendsList.accepted.filter(f =>
                f.friend.username.toLowerCase().includes(searchFriends.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
        // Filter friend requests by username
        else {
            const combined = [...friendsList.sent, ...friendsList.received];
            const filtered = combined.filter(f =>
                f.friend.username.toLowerCase().includes(searchFriends.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    }, [searchFriends, friendsList, mode]);


    // ----- FUNCTIONS -----
    // Handle searching for users
   const handleSearchUsers = async () => {
        // Reset error, users list and loading states
        setUsersListError(null);
        setUsersList(null);
        setLoadingUsers(true);

        // Try data fetch for list of users
        try {
            const data = await getJson(
                `/users/search?filter=${encodeURIComponent(searchUsers)}`,
                null,
                { token }
            );

            setUsersList(data.users);
            if(data.users.length <= 0) setUsersListError("No users found.");
        } catch (err) {
            // Show error message
            setUsersListError(
                err.data?.message ||
                err.data?.error ||
                "Something went wrong while fetching users. Try again later!"
            );
        } finally {
            setLoadingUsers(false);
        }
    };

    // ----- RENDER -----
    return(
        <section className="friends-page-wrapper">
            {/* FRIENDS COLUMN */}
            <div className="column">
                {/* Search bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        value={searchFriends}
                        placeholder="Search friends..."
                        onChange={(e) => setSearchFriends(e.target.value)}
                    />
                    <img src={images.search}></img>
                </div>

                {/* Column title */}
                <div className="column-title">
                    <h3>Friends List</h3>
                    <div className="mode-options">
                        <div 
                            className={mode === modes.accepted ? "option active" : "option"}
                            onClick={() => setMode(modes.accepted)}>
                                Friends
                        </div>
                        <div 
                            className={mode === modes.requests ? "option active" : "option"}
                            onClick={() => setMode(modes.requests)}>
                                Requests
                                {friendsList?.received.length > 0 && 
                                    <div className="count">{friendsList.received.length}</div>
                                }
                        </div>
                    </div>
                </div>

                {/* Friends list */}
                {friendsListError ? (
                    // Display an error
                    <p>{friendsListError}</p>
                    // Show loading component while fetching data
                ) : loadingFriends ? (
                    <h1>Loading...</h1>
                ) : (
                    mode === modes.accepted ? (
                        // Show list of friends
                        filteredFriends?.length > 0 ? (
                            <div className="list">
                                {filteredFriends.map((f) => {
                                    return (
                                        <div className="list-item" key={f.id}>
                                            <h1>{f.friend.username}</h1>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : <p>No friends found</p>
                    ) : 
                    <div className="list">
                        {/* Received */}
                        <h1>Received:</h1>
                        {filteredFriends
                            ?.filter(f => !f.isRequester)
                            .map(f => (
                                <div className="list-item" key={f.id}>
                                    <h3>{f.friend.username}</h3>
                                </div>
                        ))}

                        {/* Sent */}
                        <h1>Sent:</h1>
                        {filteredFriends
                            ?.filter(f => f.isRequester)
                            .map(f => (
                                <div className="list-item" key={f.id}>
                                    <h3>{f.friend.username}</h3>
                                </div>
                        ))}
                    </div>
                )}
            </div>

            {/* USERS COLUMN */}
            <div className="column">
                {/* Search bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        value={searchUsers}
                        placeholder="Search users..."
                        onChange={(e) => setSearchUsers(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                    />
                    {/* <img src={images.search} onClick={() => handleSearchUsers()}></img> */}
                    <button onClick={() => handleSearchUsers()}>Search</button>
                </div>

                {/* Column title */}
                <div className="column-title">
                    <h3>Find New Friends</h3>
                </div>

                {/* Users list */}
                {/* Show error message */}
                {usersListError ? (
                    <p>{usersListError}</p>
                ) : loadingUsers ? (
                    // Show loading component
                    <h1>Loading...</h1>
                ) : usersList ? (
                    // Show list of users
                    usersList.length > 0 ? (
                        <div className="list">
                            {usersList.map((u) => (
                                <div className="list-item" key={u.id}>
                                    <h3>{u.username}</h3>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No users found</p>
                    )
                ) : (
                    <p>Search for users to add as friends</p>
                )}
            </div>
        </section>
    );
}