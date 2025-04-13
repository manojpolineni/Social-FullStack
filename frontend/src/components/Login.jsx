import { useForm } from "react-hook-form";
import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Login = () => {
  const { login, user, loading, fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user,loading, navigate]);

  const onSubmit = async (data) => {
    setLoadingForm(true);
    setError("");
    try {
      await login(data);
      navigate('/dashboard');
      fetchUser();
    } catch (err) {
      setError(err);
    }
    finally {
      setLoadingForm(false);
    }
  };

  return (
    
    <div className="relative w-full h-screen animate-gradient-move bg-gray-900 flex justify-center items-center overflow-hidden">
      {/* Glassmorphic Login Form */}
      <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-[500px] border border-white/20">
        <h2 className="text-white text-2xl font-semibold text-center mb-6">
          Login
        </h2>
        {error && <p className="text-red-300 text-center mb-3">{error}</p>}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full gap-4 text-white"
        >
          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              validate: (value) => {
                if (!value.includes("@")) {
                  return "Email must include @";
                }
                if (
                  !(
                    value.endsWith(".com") ||
                    value.endsWith(".in") ||
                    value.endsWith(".org")
                  )
                ) {
                  return "Email must end with .com or .in or .org";
                }

                return true;
              },
            })}
            className="bg-white/10 h-10 border border-white/20 rounded-md text-white placeholder:text-white/70 outline-none py-1 px-2"
          />
          {errors.email && (
            <p className="text-red-300 text-md text-base">
              {errors.email.message}
            </p>
          )}

          <div className="relative w-full">
            <input
              type={!showPassword ? "password" : "text"}
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="bg-white/10 h-12 border border-white/20 w-full rounded-md text-white placeholder:text-white/70 outline-none py-1 px-2"
            />
            {showPassword ? (
              <Eye
                size={24}
                className="absolute right-3 top-3 cursor-pointer text-white/70"
                onClick={() => setShowPassword(!showPassword)}
              />
            ) : (
              <EyeOff
                size={24}
                className="absolute right-3 top-3 cursor-pointer text-white/70"
                onClick={() => setShowPassword(!showPassword)}
              />
            )}
          </div>
          {errors.password && (
            <p className="text-red-300 text-base ">{errors.password.message}</p>
          )}

          <button
            type="submit"
            className=" cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg mt-4 transition-transform hover:scale-105"
          >
            {loadingForm ? "Logging in..." : "Login"}
          </button>

          <p>
            Don’t have an account?
            <Link to="/signup" className="text-white hover:text-blue-500 ml-1">
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Login;
