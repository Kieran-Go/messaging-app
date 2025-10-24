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

            // --- Locally update chatList to reset unread count for this chat ---
            setChatList(prevChats => prevChats.map(chat => {
                if(chat.id === chatId) {
                    // Reset unread count for current user
                    const updatedMembers = chat.members.map(m => 
                        m.user.id === user.id ? { ...m, unreadCount: 0 } : m
                    );
                    return { ...chat, members: updatedMembers };
                }
                return chat;
            }));
        }
        catch(err) { setFetchOpenChatError(err.message); }
        finally{ setLoadingOpenChat(false); }
    }

    // Returns the list of chat members, excluding current user
    const getChatMembers = (chatMembers) => {
        const otherUsers = chatMembers
            .filter(m => m.user?.id !== user.id)
            .map(m => m.user?.username || "Deleted User");

        if (otherUsers.length === 0) return "Deleted User";

        return otherUsers.join(", ");
    };

    // Returns the number of unread messages
    const getUnreadCount = (members) => {
        // Find the current user in members
        const currentUser = members.find(m => m.user.id === user.id);

        // Get the current user's undread count
        const count = currentUser ? currentUser.unreadCount : 0;

        // Return null if no unread messages
        if(count <= 0) return null;

        return count;
    }

    // Hide or leave a chat
    const leaveChat = async (chat) => {
        // Confirm if it's a group chat
        if(chat.isGroup) {
            if(!confirm("Are you sure you want to leave this group chat?")) return;
        }

        // Set loading
        setLoadingChats(true);
        if(chat.id == openChat?.id) setLoadingOpenChat(true);

        try{
            // Call backend to leave chat
            await putJson(`/chats/${chat.id}/leave`, {}, { token });

            // Remove chat from local chatList
            setChatList((prev) => prev.filter(c => c.id !== chat.id));

            // Close the open chat if it was this one
            if(openChat?.id === chat.id) setOpenChat(null);
        }
        catch(err) { alert(err.message); }
        finally{ 
            setLoadingChats(false); 
            setLoadingOpenChat(false);
        }
    }

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
                                    <div className="count">{getUnreadCount(c.members)}</div>
                                    <img src={images.chat} onClick={() => fetchOpenChat(c.id)}/>
                                    <img src={images.close} onClick={() => leaveChat(c)}/>
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
                setOpenChat={setOpenChat}
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