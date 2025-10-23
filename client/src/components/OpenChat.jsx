import { useState, useEffect } from "react";
import images from "../utility/images";
import "../css/OpenChat.css";

export default function OpenChat({openChat, loading, error, getChatMembers}) {
    // ----- STATES -----
    const [message, setMessage] = useState("");
    const [sendMessageLoading, setSendMessageLoading] = useState(false);
    const [messageError, setMessageError] = useState(null);

    // ----- FUNCTIONS -----
    const sendMessage = async() => {
        // Start loading
        setSendMessageLoading(true);

        // Reset message error
        setMessageError(null);

        // Return if message length less than 1 or greater than 2000
        if(message.length < 1 ) return;
        else if(message.length > 2000) {
            setMessageError("Message cannot have more than 2000 characters");
            return;
        }

        // Attempt to create the new message
        try{

        }
        catch(err) { setMessageError(err.message); }
        finally { sendMessageLoading(false); }
    }

    // ----- RENDER -----
    return(
        <div className="column">
            {/* Header for open chat */}
            <div className="head">
                <div className="chat-head">
                    {openChat ? 
                        <h2>{openChat.name || getChatMembers(openChat.members)}</h2> :
                        <h2>Chat</h2>
                    }
                    {openChat?.isGroup && <img src={images.plus}/>}
                    
                </div>
            </div>

            {/* Open-chat container */}
            <div className="chat-window">
                {
                    loading ? <h1>Loading...</h1> :
                    error ? <p>{error}</p> :
                    openChat ?
                        <div className="chat">
                            {/* Chat here */}
                            <h1>Chat is open</h1>
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