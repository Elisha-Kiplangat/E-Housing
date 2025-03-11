import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./completeOrder.scss";

const completeOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transactionId = location.state?.transactionId; // Get Transaction ID from state

  const handleCompleteOrder = async () => {
    if (!transactionId) {
      alert("Transaction ID not found. Cannot complete order.");
      return;
    }

    try {
      const response = await fetch("https://1f6f-102-215-33-50.ngrok-free.app/completeorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Order confirmed! Check your email.");
        navigate("/"); // Redirect to home
      } else {
        alert("Failed to confirm order. Try again.");
      }
    } catch (error) {
      alert("Error processing order.");
    }
  };

  const handleCancelBooking = () => {
    alert("Booking cancelled.");
    navigate("/");
  };

  return (
    <div className="order-options-container">
      <h2>Payment Successful</h2>
      <p>Your payment has been received. Please choose how you want to proceed:</p>
      <div className="button-group">
        <button className="complete-btn" onClick={handleCompleteOrder}>Complete Order</button>
        <button className="cancel-btn" onClick={handleCancelBooking}>Cancel Booking</button>
      </div>
    </div>
  );
};

export default completeOrder;
