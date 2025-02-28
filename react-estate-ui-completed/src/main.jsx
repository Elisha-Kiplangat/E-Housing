import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.scss";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import { SavedPostsProvider } from "./context/SavedPostsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthContextProvider>
      <SocketContextProvider>
        <SavedPostsProvider>
        <App />
        </SavedPostsProvider>
      </SocketContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
