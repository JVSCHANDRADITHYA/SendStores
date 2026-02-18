import { useState } from "react";
import Login from "./Login";

export default function AuthGate({ children }) {
  const [authed, setAuthed] = useState(
    Boolean(localStorage.getItem("token"))
  );

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />;
  }

  return children;
}
