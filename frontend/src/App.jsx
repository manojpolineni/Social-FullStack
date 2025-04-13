import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import ProtectedRoute from "./utils/ProtectedRoute";
import Profile from "./pages/Profile";
import Register from "./components/Register";
import ChatPage from "./pages/Chat";
import MyPosts from "./pages/MyPosts";
import { io } from "socket.io-client";

const socket = io("http://localhost:9999", { withCredentials: true });

const App = () => {
  
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* Protected Routes */}
        <Route element={ <ProtectedRoute><Layout /></ProtectedRoute> } >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mypost" element={<MyPosts />} />
          <Route path="/chat" element={<ChatPage socket={socket}/>} />
        </Route>

        {/* Redirect to Login for unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

export default App;
