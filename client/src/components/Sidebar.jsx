import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import images from "../utility/images.js";
import '../css/Sidebar.css';

export default function Sidebar({ mainComponents, setActiveComponent }) {
    // ----- CONTEXTS -----
    const { user } = useContext(AuthContext);

    // ----- STATES -----
    const [showSidebar, setShowSidebar] = useState(true);

    // ----- EFFECTS -----
    useEffect(() => {
        // Automatically hide sidebar at the start if window width is small enough
        if (window.innerWidth <= 550) setShowSidebar(false);
    }, []);

    // Array of menu selection objects
    const menuSelections = [
        { text: "Chats", img: images.chat, component: mainComponents.chats, hideSidebar: true },
        { text: "Friends", img: images.heart, component: mainComponents.friends, hideSidebar: true },
        { text: "Account", img: images.profile , component: mainComponents.account, hideSidebar: true },
        { text: "Logout", img: images.logout, hideSidebar: false, onClick: () => { 
            localStorage.removeItem("token");
            window.location.reload();} 
        },
    ]

    // ----- RENDER -----
    return(
        <div className="sidebar-wrapper">
            {/* Menu button */}
            <img
                src={images.menu} 
                className={!showSidebar ? "btn menu-btn" : "btn menu-btn hidden"}
                onClick={() => setShowSidebar(true)}
            />

            {/* Sidebar */}
            <section className={showSidebar ? "sidebar" : "sidebar hidden"}>
                {/* Close menu button */}
                <img
                    src={images.close}
                    className="btn close-btn"
                    onClick={() => setShowSidebar(false)}
                />

                {/* Sidebar head */}
                <div className="head">
                    <h1>ChatBox</h1>
                    <img src={images.logo}/>
                </div>

                {/* Sidebar account name */}
                <div className="account-info">
                    <img src={images.account}/>
                    <p>{user.username}</p>
                </div>

                {/* Menu Wrapper */}
                <div className="menu-wrapper">
                    <h3>MENU</h3>
                    {menuSelections.map((selection) => {
                        return(
                            <div key={selection.text} className="menu-select" 
                            onClick={() => { selection.component ?
                                setActiveComponent(selection.component) : selection.onClick?.()
                                selection.hideSidebar && setShowSidebar(false)
                            }
                            }>
                                <img src={selection.img}/>
                                <p>{selection.text}</p>
                            </div>
                        )
                    })}
                </div>


            </section>

            {/* Overlay (only visible on mobile when sidebar is open) */}
            <div
                className={showSidebar ? "overlay" : "overlay hidden"}
                onClick={() => setShowSidebar(false)}
            ></div>
        </div>
    );
}