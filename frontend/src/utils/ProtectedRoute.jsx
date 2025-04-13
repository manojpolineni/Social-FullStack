import { Outlet, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);
  
  // if (loading) {
  //   return (
  //     <div className="h-screen flex items-center justify-center text-gray-600 text-lg">
  //       Loading...
  //     </div>
  //   );
  // }

  return user ? children || <Outlet /> : null;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
