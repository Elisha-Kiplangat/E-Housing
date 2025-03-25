import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./completeOrder.scss";

const CompleteOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState();
  const checkoutId = location.state?.checkoutId; 
  const bookingId = location.state?.bookingId; 

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(" Received checkoutId in CompleteOrder:", checkoutId);

    if (!checkoutId) {
      alert("Checkout ID not found. Redirecting to home.");
      navigate("/"); 
    }
  }, [checkoutId, navigate]);

  const handleCompleteOrder = async () => {
    let CheckoutRequestID = checkoutId;
    if (!CheckoutRequestID) {
      alert("❌ Missing Checkout ID. Cannot proceed.");
      return;
    }

    setLoading(true);

    try {
      console.log("🔹 Sending request with Checkout ID:", CheckoutRequestID);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL3}/complete`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ CheckoutRequestID }),
        }
      );

      console.log("🔹 Response Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server Error");
      }

      const data = await response.json();
      console.log(" API Response:", data);

      alert("✅ Order confirmed! Check your email.");
      navigate("/"); // Redirect after success
    } catch (error) {
      console.error("🚨 API Error:", error);
      alert("❌ Failed to complete order. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-options-container">
      <h2>Payment Successful</h2>
      <p>
        Your payment has been received. Click <b>Complete Order</b> to proceed.
      </p>
      <div className="button-group">
        <button
          className="complete-btn"
          onClick={handleCompleteOrder}
          disabled={loading}
        >
          {loading ? "Processing..." : "Complete Order"}
        </button>
        <button className="cancel-btn" onClick={() => navigate("/")}>
          Cancel Booking
        </button>
      </div>
    </div>
  );
};

export default CompleteOrder;
