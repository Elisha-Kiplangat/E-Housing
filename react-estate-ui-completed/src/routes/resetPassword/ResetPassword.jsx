import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import "./resetPassword.scss";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  // Validate token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await apiRequest.get(`/auth/verify-reset-token/${token}`);
        setIsTokenValid(true);
      } catch (err) {
        setError("Invalid or expired reset token. Please request a new one.");
        setIsTokenValid(false);
      } finally {
        setTokenChecked(true);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("No reset token provided.");
      setTokenChecked(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");
    
    try {
      const response = await apiRequest.post("/auth/reset-password", {
        token,
        newPassword: password
      });
      
      setMessage("Password reset successful!");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenChecked) {
    return (
      <div className="reset-password">
        <div className="loading">Verifying reset token...</div>
      </div>
    );
  }

  return (
    <div className="reset-password">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Create New Password</h1>
          
          {!isTokenValid ? (
            <div className="error-box">
              <p className="error-message">{error}</p>
              <Link to="/forgot-password" className="request-link">
                Request a new reset link
              </Link>
            </div>
          ) : (
            <>
              <p className="instructions">
                Enter your new password below.
              </p>
              
              <input
                name="password"
                required
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
              
              <input
                name="confirmPassword"
                required
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
              
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
            </>
          )}
          
          <Link to="/login" className="back-link">
            Back to Login
          </Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default ResetPassword;