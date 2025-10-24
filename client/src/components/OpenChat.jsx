import { useContext, useState, useEffect, useRef, } from "react";
import images from "../utility/images";
import "../css/OpenChat.css";
import { postJson } from "../utility/fetchUtility";
import { AuthContext } from "./AuthContext";
import { formatTime } from "../utility/formatTime";

// Get token from local storage
const token = localStorage.getItem('token');

export default function OpenChat({openChat, setOpenChat, loading, error, getChatMembers}) {
    // ----- CONTEXTS -----
    const { user } = useContext(AuthContext);

    // ----- STATES -----
    const [message, setMessage] = useState("");
    const [sendMessageLoading, setSendMessageLoading] = useState(false);
    const [messageError, setMessageError] = useState(null);

    // ----- REFS -----
    const chatEndRef = useRef(null);

    // ----- EFFECTS
    // Scroll to bottom whenever messages change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "auto" });
        }
    }, [openChat?.messages]);

    // ----- FUNCTIONS -----
    const sendMessage = async() => {
        // Return if message length less than 1 or greater than 2000
        if(message.length < 1 ) return;
        else if(message.length > 2000) {
            setMessageError("Message cannot have more than 2000 characters");
            return;
        }

        // Clear input
        setMessage("");

        // Start loading
        setSendMessageLoading(true);

        // Reset message error
        setMessageError(null);

        // Attempt to create the new message
        try{
            const data = await postJson(
                `/chats/${openChat.id}/messages`,
                { content: message },
                { token }
            )

            // Add new message too openChat messages
            setOpenChat(prev => ({ ...prev, messages: [...prev.messages, data] }));
        }
        catch(err) { setMessageError(err.message); }
        finally { setSendMessageLoading(false); }
    }

    // ----- RENDER -----
    return(
        <div className="column">
            {/* Header for open chat */}
            <div className="head">
    <div className="chat-head">
        {openChat ? (
            <h3>
                {/* Chat name if it exists */}
                {openChat.name && <>{openChat.name} </>}

                {/* Members in a span if group */}
                {openChat.isGroup && (
                    <span className="chat-members">
                        ({getChatMembers(openChat.members)})
                    </span>
                )}
            </h3>
        ) : (
            <h3>Chat</h3>
        )}

        {/* Plus button for group chats */}
        {openChat?.isGroup && <img src={images.plus} alt="Add member" />}
    </div>
</div>



            {/* Open-chat container */}
            <div className="chat-window">
                {
                    loading ? <h1>Loading...</h1> :
                    error ? <p>{error}</p> :
                    openChat ?
                        <div className="chat">
                            {/* Chat messages here */}
                            <div className="messages-scroll">
                            {openChat?.messages.map((m) => (
                                <div key={m.id} className={user.id === m.user?.id ? "message sent" : "message received"}>
                                    <h3 className={m.user ? "" : "deleted-user"}>{m.user?.username || "Deleted User"}</h3>
                                    <p>{m.content}</p>
                                    <p className="send-time">{formatTime(m.sentAt)}</p>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                    {/* Chat input */}
                    {messageError && <p>{messageError}</p>}
                    <input 
                        type="text"
                        value={message}
                        onChange={(e) =>{ setMessageError(null); setMessage(e.target.value); }}
                        placeholder="Message"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        minLength={1}
                        maxLength={2000}
                        disabled={sendMessageLoading}
                    />
                </div> 
                : <h2 className="no-chat-msg">Select a Chat to start chatting</h2>
                }
            </div>
        </div>
    );
}