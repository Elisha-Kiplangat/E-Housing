import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./completeOrder.scss";
import Cookies from 'js-cookie';

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
        `${import.meta.env.VITE_BACKEND_URL}/complete`, 
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

    // Store the response data first, then check if it's OK
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || "Server Error");
    }

    console.log("🔹 API Response:", responseData);
    
    // Use data from responseData
    // const token = Cookies.get("token");
    // if (!token) {
    //   throw new Error("Authentication token missing. Please log in again.");
    // }
    // const paymentResponse = await fetch(
    //   `${import.meta.env.VITE_BACKEND_URL}/payment/save`, 
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${token}`,
    //     },
    //     body: JSON.stringify({
    //       amount: responseData.amount || 0,
    //       method: "M-Pesa",
    //       transactionId: responseData.transactionId || CheckoutRequestID,
    //       bookingId: bookingId
    //     }),
    //   }
    // );

    // if (!paymentResponse.ok) {
    //   const paymentError = await paymentResponse.json();
    //   console.error("Payment record creation failed:", paymentError);
    //   throw new Error(paymentError.message || "Failed to save payment details");
    // }

    // const paymentData = await paymentResponse.json();
    // console.log("Payment record created:", paymentData);



      alert("✅ Order confirmed! Check your email.");
      navigate("/"); // Redirect after success
    } catch (error) {
      console.error("🚨 Payment Cancelled:", error);
      alert("❌ Failed to complete order. Please enter your M-Pesa pin.");
  //     const errorMessage = error.message || "❌ Failed to complete order. Please enter your M-Pesa pin.";
  // alert(errorMessage);
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
