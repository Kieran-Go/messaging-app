import { useContext, useState } from "react"
import { AuthContext } from "./AuthContext"
import Login from "./Login";
import Sidebar from "./Sidebar";
import Chats from "./Chats";
import Friends from "./Friends";
import Account from "./Account";

// Map of components
const mainComponents = {
  chats: () => { return (<Chats />)},
  friends: () => { return (<Friends />)},
  account: () => { return (<Account />)},
};

export default function App() {
  // ----- CONTEXTS -----
  const { user, authLoading } = useContext(AuthContext);

  // ----- STATES -----
  const [ activeComponent, setActiveComponent ] = useState(mainComponents.chats);

  // ----- RENDER -----
  if(authLoading) return <>Loading...</> // Render Loading component when authLoading
  if(!user) return <Login /> // Render the login page if no authenticated user

  // Render main app components
  const ActiveComponent = activeComponent;
  return (
    <div className="page-wrapper">
      {/* Sidebar */}
      <Sidebar mainComponents={mainComponents} setActiveComponent={setActiveComponent} />

      {/* Active component */}
      <div className="main-content">
        {ActiveComponent}
      </div>
    </div>
  );
}