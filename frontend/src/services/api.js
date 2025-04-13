import axios from 'axios';

const Auth = axios.create({
      baseURL: 'https://social-fullstack-backend.onrender.com/api',
      withCredentials: true,
});

// 🔐 Add interceptor to handle expired sessions
Auth.interceptors.response.use(
      (response) => response,
      (error) => {
            if (
                  error.response &&
                  error.response.status === 401 &&
                  error.response.data?.message === "Unauthorized"
            ) {
                  // Optional: toast or alert
                  alert("Session expired. Please log in again.");

                  // Clear localStorage/session storage
                  localStorage.removeItem("user");

                  // Redirect to login
                  window.location.href = "/login";
            }

            return Promise.reject(error);
      }
);

//follow && unfollow users API
export const followUser = async (userId) => {
      try {
            const res = await Auth.post(`/users/follow/${userId}`);
            return res.data;
      } catch (error) {
            console.error("Error following user:", error);
      }
};

export const unfollowUser = async (userId) => {
      try {
            const res = await Auth.post(`/users/unfollow/${userId}`);
            return res.data;
      } catch (error) {
            console.error("Error unfollowing user:", error);
      }
};

export default Auth;

