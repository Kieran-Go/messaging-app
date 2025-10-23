import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { getJson, postJson, putJson, deleteJson } from "../utility/fetchUtility.js"; 
import NewChatsForm from "./NewChatsForm";
import images from "../utility/images.js";
import "../css/Chats.css";
import OpenChat from "./OpenChat.jsx";

// Get token from local storage
const token = localStorage.getItem('token');

export default function Chats() {
    // ----- CONTEXTS -----
    const { user } = useContext(AuthContext);

    // ----- STATES -----
    const [chatList, setChatList] = useState(null);
    const [openChat, setOpenChat] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [friendsList, setFriendsList] = useState(null);

    // Loading states
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingOpenChat, setLoadingOpenChat] = useState(false);
    const [loadingFriends, setLoadingFriends] = useState(false);
    
    // Error states
    const [fetchChatsError, setFetchChatsError] = useState(null);
    const [fetchOpenChatError, setFetchOpenChatError] = useState(null);
    const [fetchFriendsError, setFetchFriendsError] = useState(null);

    // ----- EFFECTS -----
    // On first mount
    useEffect(() => {
        // Fetch the list of user's chats
        const fetchChats = async() => {
            try{
                const data = await getJson("/chats", null, { token });
                if(data.length > 0) setChatList(data);
            }
            catch(err) { setFetchChatsError(err.message); }
            finally{ setLoadingChats(false); }
        }
        fetchChats();
    },[]);

    // Fetch list of friends on showing the form
    useEffect(() => {
        // Return if form is not being shown or friends list already fetched
        if(!showForm || friendsList) return;

        // Set loading
        setLoadingFriends(true);

        const fetchFriends = async() => {
            // Attempt to fetch the list of friends
            try{
                const data = await getJson("/friendships", null, { token });
            
                // Extract accepted friends
                const friends = data
                    .filter(friendship => friendship.accepted)
                    .map(friendship => friendship.friend);

                // Set the friends list if any
                if (friends.length) setFriendsList(friends);
            }
            catch(err) { 
                setFetchFriendsError(err.message);
            }
            finally{ setLoadingFriends(false); }
        }
        fetchFriends();

    },[showForm]);

    // ----- FUNCTIONS -----
    // Fetches the open chat
    const fetchOpenChat = async(chatId) => {
        // Set loading
        setLoadingOpenChat(true);

        // Attempt fetch
        try{
            const data = await getJson(`/chats/${chatId}`, null, { token });
            setOpenChat(data);
        }
        catch(err) { setFetchOpenChatError(err.message); }
        finally{ setLoadingOpenChat(false); }
    }

    // Returns the list of chat members, excluding user
    const getChatMembers = (chatMembers) => 
        chatMembers
            .filter(m => m.user.id !== user.id)
            .map(m => m.user.username)
            .join(", ");


    // ----- RENDER -----
    return(
        <section className="chats-page-wrapper">
            {/* ----- CHAT LIST COLUMN ----- */}
            <div className="column">
                {/* Header for chat-list */}
                <div className="head">
                    <h2>All Chats</h2>
                    <button onClick={(() => { setShowForm(true);})}>New</button>
                </div>

                {/* Chat-list */}
                <div className="chat-list">
                    {/* Show loading component */}
                    {loadingChats ? 
                        <h1>Loading...</h1> :

                        // Show fetch error
                        fetchChatsError ? <p>{fetchChatsError}</p> :

                        // Show chat list or empty message if no chats
                        chatList && chatList.length > 0 ? 
                        chatList.map((c) => (
                            <div key={c.id} className="list-item">
                                <h3>{c.name || getChatMembers(c.members)}</h3>
                                <div className="list-actions">
                                    <img src={images.chat} onClick={() => fetchOpenChat(c.id)}/>
                                    <img src={images.close} onClick={() => console.log("Close chat")}/>
                                </div>
                            </div>
                        )) :
                        <p className="empty-msg">No chats found</p>
                    }
                    
                </div>
            </div>

            {/* ----- OPEN-CHAT COLUMN ----- */}
            <OpenChat 
                openChat={openChat} 
                loading={loadingOpenChat} 
                error={fetchOpenChatError} 
                getChatMembers={getChatMembers}
            />
            

            {/* Show the new-chats form */}
            {showForm && 
                <NewChatsForm 
                    friends={friendsList}
                    loadingFriends={loadingFriends}
                    friendsError={fetchFriendsError}
                    setShowForm={setShowForm}
                />
            }
        </section>
    );
}