// import { createContext, useState, useEffect } from "react";
// import Auth from "../services/api";
// import PropTypes from "prop-types";
// import { io } from "socket.io-client";
// const socket = io('http://localhost:9999');

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });
//   const [loading, setLoading] = useState(true);


//   const fetchUser = async () => {
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     if (!storedUser) {
//       setLoading(false);
//       return;
//     }
//     try {
//       const res = await Auth.get(`/users/${storedUser.id}`);
//         if (res.data?.user) {
//         setUser(res.data.user);
//       }
//     } catch (error) {
//       console.log("User not authenticated", error.message);
//       setUser(null);
//       localStorage.removeItem("user"); 
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     if (user?.id) {
//       socket.emit("userOnline", user.id);
//       // console.log("🟢 Emitting userOnline event with ID:", user.id);
//     } else {
//       console.warn("No user Id found, cannot set online!");
//     }

//     return () => {
//       console.log("🔴 Disconnecting socket...");
//       socket.disconnect();
//     };
//   }, [user]);

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   const login = async (credentials) => {
//     try {
//       const res = await Auth.post("/auth/login", credentials);
//       const userData = res.data?.user;
//       if (!userData || !userData.id) {
//         return;
//       }
//       setUser(userData);
//       localStorage.setItem("user", JSON.stringify(userData));
//       setTimeout(() => {
//         socket.emit("userOnline", userData.id);
//         // console.log("🟢 Emitting userOnline event after login:", userData.id);
//       }, 500);

//     } catch (error) {
//       throw error.response?.data?.message || "Login Failed";
//     }
//   };

//   const logout = async () => {
//     try {
//       await Auth.post("/auth/logout");
//       localStorage.removeItem("user");
//       setUser(null);
//       window.location.href = "/";
//     } catch (error) {
//       console.error("Logout failed", error.message);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser, login, logout, loading, fetchUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

// export default AuthContext;

import { createContext, useState, useEffect } from "react";
import Auth from "../services/api";
import PropTypes from "prop-types";
import { io } from "socket.io-client";

const socket = io("http://localhost:9999");

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // 🔁 Fetch user from backend to verify token/session
  const fetchUser = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      setLoading(false);
      return;
    }
    try {
      const res = await Auth.get(`/users/${storedUser.id}`);
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.log("User not authenticated:", error.message);
      setUser(null);
      localStorage.removeItem("user");
      alert("Session expired. Please login again.");
    }
    setLoading(false);
  };

  // ✅ Auto logout on token expiry (401) using Axios interceptor
  useEffect(() => {
    const interceptor = Auth.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("⛔ Session expired or Unauthorized. Logging out...");
          logout(); // call logout if 401 error is caught
        }
        return Promise.reject(error);
      }
    );
    return () => {
      Auth.interceptors.response.eject(interceptor);
    };
  }, []);

  // 🟢 Emit userOnline on mount
  useEffect(() => {
    if (user?.id) {
      socket.emit("userOnline", user.id);
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await Auth.post("/auth/login", credentials);
      const userData = res.data?.user;
      if (!userData || !userData.id) {
        return;
      }
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setTimeout(() => {
        socket.emit("userOnline", userData.id);
      }, 500);
    } catch (error) {
      throw error.response?.data?.message || "Login Failed";
    }
  };

  const logout = async () => {
    try {
      await Auth.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error.message);
    }
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/"; // redirect to login/home
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
