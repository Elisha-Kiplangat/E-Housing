
import { useContext, useState } from "react";
import "./login.scss";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");
  const formData = new FormData(e.target);

  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const res = await apiRequest.post("/auth/login", { username, password });

    if (res.data.role === "admin") {
      updateUser(res.data);
      
      navigate("/");
    } else {
      setError("Not Authorized!");
    }
  } catch (err) {
    setError(err.response?.data?.message || "An error occurred. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <input
            name="username"
            required
            minLength={3}
            maxLength={20}
            type="text"
            placeholder="Username"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
          />
          <button disabled={isLoading}>Login</button>
          {error && <span>{error}</span>}
        <a href="http://localhost:5173/login">Not a Guest?</a>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default Login;
