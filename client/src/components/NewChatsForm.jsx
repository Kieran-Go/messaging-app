import images from "../utility/images";
import "../css/NewChatsForm.css";

export default function NewChatsForm({friends, loadingFriends, friendsError, setShowForm}) {
    return(
        <>
            {/* Black overlay */}
            <div className="overlay"></div>

            {/* Form */}
            <form className="new-chat-form" >
                {/* Close form button */}
                <img className="close-btn" src={images.close} onClick={() => setShowForm(false)}/>

                {/* Form title */}
                <h1>New Chat</h1>
            </form>
        </>
    );
}