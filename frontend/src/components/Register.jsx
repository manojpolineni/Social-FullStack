import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Auth from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
      
  const validateEmail = (email) => {
    if (!email.includes("@")) {
      return "Email must contain the '@' symbol";
    }
    const domainPart = email.split("@")[1];
    if (!domainPart) {
      return "Domain name is missing after '@'";
    }
    if (!domainPart.includes(".")) {
      return "Email must contain a '.' after the '@' symbol";
    }
    if (!/\.(com|in|org|net)$/.test(email)) {
      return "Email must end with a valid domain like '.com', '.in', or '.org'";
    }
    return true;
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[7-9][0-9]{9}$/;
    if (!phone) {
      return "Phone number is required";
    }
    if (!phoneRegex.test(phone)) {
      return "Invalid phone number format. It should start with 7, 8, or 9 and be 10 digits long.";
    }

    return true;
  };

  const onSubmit = async (data) => {
    setLoadingForm(true);
    setError("");
    try {
      const res = await Auth.post("/auth/register", data);
      // console.log("data", res.data);
      if (res.status === 201) { 
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="relative w-full h-screen animate-gradient-move bg-gray-900 flex justify-center items-center overflow-hidden">
      {/* Animated Gradient Bubbles */}

      {/* Glassmorphic Login Form */}
      <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-[500px] border border-white/20">
        <h2 className="text-white text-2xl font-semibold text-center mb-6">
          Register
        </h2>
        {error && <p className="text-red-400 text-center mb-3">{error}</p>}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full gap-4 relative"
        >
          <input
            type="userName"
            placeholder="User Name"
            {...register("userName", { required: "User Name is required" })}
            className="bg-white/10 h-10 border border-white/20 rounded-md text-white placeholder:text-white/70 outline-none py-1 px-2"
          />
          {errors.userName && (
            <p className="text-red-400 text-sm">{errors.userName.message}</p>
          )}
          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              validate: validateEmail,
            })}
            className="bg-white/10 h-10 border border-white/20 rounded-md text-white placeholder:text-white/70 outline-none py-1 px-2"
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email.message}</p>
          )}
          <input
            id="phone"
            type="text"
            placeholder="Phone"
            name="phone"
            {...register("phone", {
              required: "Phone is Required",
              validate: validatePhoneNumber,
            })}
            className="bg-white/10 h-10 border border-white/20 rounded-md text-white placeholder:text-white/70 outline-none py-1 px-2"
          />
          {errors.phone && (
            <p className="text-red-400 text-sm">{errors.phone.message}</p>
          )}
          <div className="relative w-full">
            <input
              type={!showPassword ? "password" : "text"}
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="bg-white/10 w-full h-10 border border-white/20 rounded-md text-white placeholder:text-white/70 outline-none py-1 px-2"
            />
            {!showPassword ? (
              <EyeOff
                size={24}
                className="absolute right-4 top-1/2 cursor-pointer -translate-y-1/2 pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            ) : (
              <Eye
                size={24}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            )}
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password.message}</p>
          )}
          <button
            type="submit"
            className=" cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg mt-4 transition-transform hover:scale-105"
          >
            {loadingForm ? "Registering" : "Register"}
          </button>
          <p className="">Already have an account?
          <Link to="/" className="hover:text-blue-500 ml-1">
            Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
