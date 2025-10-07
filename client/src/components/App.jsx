import { useContext } from "react"
import { AuthContext } from "./AuthContext"
import Login from "./Login";

export default function App() {
  // Get user and authLoading context
  const { user, authLoading } = useContext(AuthContext);

  // Render Loading component when authLoading
  if(authLoading) return <>Loading...</>

  // Render the login page if no authenticated user
  if(!user) return <Login />

  // Render main app components
  return (
    <>
      <h1>Hello, World!</h1>
    </>
  );
}