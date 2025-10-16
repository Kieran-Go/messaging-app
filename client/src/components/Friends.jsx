import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import images from "../utility/images.js";
import { getJson, postJson, putJson, deleteJson } from "../utility/fetchUtility.js";
import "../css/Friends.css";

// Get token from local storage
const token = localStorage.getItem('token');

// Object to decide whether to show accepted friends or friend requests
const modes = { accepted: 0, requests: 1 };

export default function Friends() {
    // ----- CONTEXTS -----
    const { user } = useContext(AuthContext);

    // ----- STATES -----
    // Search-bar states
    const [searchFriends, setSearchFriends] = useState("");
    const [searchUsers, setSearchUsers] = useState("");

    // Data states
    const [friendsList, setFriendsList] = useState(null);
    const [filteredFriends, setFilteredFriends] = useState(null);
    const [usersList, setUsersList] = useState(null);

    // State for sub-menu
    const [subMenu, setSubMenu] = useState({
        visible: false, x: 0, y: 0, options: []
    });

    // State to determine whether to show accepted friends or friend requests
    const [mode, setMode] = useState(modes.accepted);

    // Loading states
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Error message states
    const [friendsListError, setFriendsListError] = useState(null);
    const [usersListError, setUsersListError] = useState(null);

    // ----- EFFECTS -----
    // On first mount
    useEffect(() => {
        const fetchFriends = async () => {
            try{
                // Fetch user's friends
                const friends = await getJson("/friendships", null, { token });

                // Sort friends into different categories
                const accepted = []; const sent = []; const received = [];
                for(let i = 0; i < friends.length; i++) {
                    const friend = friends[i];
                    if(friend.accepted) accepted.push(friend);
                    else {
                        if(friend.isRequester) sent.push(friend);
                        else received.push(friend);
                    }
                }
                // Set lists
                setFriendsList({ accepted, sent, received  });
                setFilteredFriends(mode === modes.accepted ? accepted : [...sent, ...received]);
            }
            catch (err) {
                // Set the error
                setFriendsListError(err.data?.message || err.data?.error ||
                    "Something went wrong while fetching your friends list. Try again later!");
            }
            // Stop loading after completion
            finally { setLoadingFriends(false) }
        }
        fetchFriends();
    },[]);

    // Update filtered friends whenever searchFriends, friendsList or mode changes
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

            // Set users list to fetched data
            setUsersList(data.users);

            // If fetch found no users, display feedback to user with error message
            if(data.users.length <= 0) setUsersListError("No users found.");
        } catch (err) {
            // Show error message
            setUsersListError(
                err.data?.message ||
                err.data?.error ||
                "Something went wrong while fetching users. Try again later!"
            );
        } 
        finally {
            // End loading
            setLoadingUsers(false);
        }
    };

    // Handle sub-menu toggle
    const handleOptionsClick = (e, options) => {
        // Click position relative to viewport
        const { clientX, clientY } = e;

        // Toggle or move submenu
        setSubMenu({
            visible: true,
            x: clientX,
            y: clientY,
            options
        });
    };

    // Handle unfriending a user
    const unfriend = async (friendship) => {
        console.log(`Unfriended ${friendship.friend.username}`);
        setSubMenu(prev => ({ ...prev, visible: false }));
    }

    // Handle blocking a user
    const blockUser = async (target) => {
        const isFriend = target.friend;
        const userId = isFriend ? target.friend.id : target.id;
        console.log(`Blocked user with the ID of ${userId}`);
        setSubMenu(prev => ({ ...prev, visible: false }));
    }

    // ----- RENDER -----
    return(
        // Main wrapper of page's content
        <section className="friends-page-wrapper">
            {/* ----- FRIENDS COLUMN ----- */}
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
                                            <div className="user-info">
                                                <h3>{f.friend.username}</h3>
                                                {f.friend.lastSeen && 
                                                    <p>{"Last seen: " + f.friend.lastSeen}</p>
                                                }
                                            </div>

                                            <div className="user-actions">
                                                <img src={images.chatFriend}/>
                                                <img
                                                    src={images.options}
                                                    onClick={(e) => handleOptionsClick(e, [
                                                        { name: "Unfriend", func: () => unfriend(f) },
                                                        { name: "Block", func: () => blockUser(f) }
                                                    ])}
                                                />
                                            </div>
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
                                    <div className="user-info">
                                        <h3>{f.friend.username}</h3>
                                    </div>

                                    <div className="user-actions">
                                        <button className="add-friend-btn">Accept</button>
                                        <button className="decline-friend-btn">Decline</button>
                                        <img
                                            src={images.options}
                                            onClick={(e) => handleOptionsClick(e, [
                                                { name: "Block", func: () => blockUser(f) }
                                            ])}
                                        />
                                    </div>
                                </div>
                        ))}

                        {/* Sent */}
                        <h1>Sent:</h1>
                        {filteredFriends
                            ?.filter(f => f.isRequester)
                            .map(f => (
                            <div className="list-item" key={f.id}>
                                <div className="user-info">
                                    <h3>{f.friend.username}</h3>
                                </div>

                                <div className="user-actions">
                                    <button className="decline-friend-btn">Delete</button>
                                    <img
                                        src={images.options}
                                        onClick={(e) => handleOptionsClick(e, [
                                            { name: "Block", func: () => blockUser(f) }
                                        ])}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ----- USERS COLUMN ----- */}
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
                                    <div className="user-info">
                                        <h3>{u.username}</h3>
                                        {u.lastSeen && 
                                            <p>{"Last seen: " + u.lastSeen}</p>
                                        }
                                    </div>

                                    <div className="user-actions">
                                        <img src={images.chatFriend}/>
                                        {!u.isFriend && <button className="add-friend-btn">Add Friend</button> }
                                        <img
                                            src={images.options}
                                            onClick={(e) => handleOptionsClick(e, [
                                                { name: "Block", func: () => blockUser(u) }
                                            ])}
                                        />
                                    </div>
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

            {/* Backdrop to block interaction with page elements while sub-menu is open */}
            {subMenu.visible && (
                <div
                    className="submenu-backdrop"
                    onClick={() => setSubMenu(prev => ({ ...prev, visible: false }))}
                ></div>
            )}

            {/* Sub-menu */}
            {subMenu.visible && (
                <div
                    className="sub-menu"
                    style={{ top: subMenu.y, left: subMenu.x - 80 }}
                >
                    {subMenu.options.map((o) => {
                        return(<p key={o.name} onClick={() => o.func()}>{o.name}</p>);
                    })}
                </div>
            )}
        </section>
    );
}