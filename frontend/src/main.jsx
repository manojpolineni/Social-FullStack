import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
// import PostProvider from "./context/PostContext.jsx";
import { PostProvider } from "./context/PostContext.jsx";
import ThemeProvider from "./context/ThemeContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";

const currentUser = JSON.parse(localStorage.getItem("user") || null);

if (!currentUser) {
  console.log("No use found  in localstorage. socket will not  initialize!");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <PostProvider>
          <ThemeProvider>
            <SocketProvider user={currentUser}>
              <App />
            </SocketProvider>
          </ThemeProvider>
        </PostProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
);
