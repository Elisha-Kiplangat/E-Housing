import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./completeOrder.scss";

const CompleteOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const paymentSaved = useRef(false); // Track if payment is already saved

  // Extract checkoutId and bookingId from the location state
  const checkoutId = location.state?.checkoutId;
  const bookingId = location.state?.bookingId;
  const amountToPay = location.state?.amountToPay;

  useEffect(() => {
    if (!checkoutId || !bookingId) {
      alert("❌ Checkout ID or Booking ID not found. Redirecting to home.");
      navigate("/");
    }
  }, [checkoutId, bookingId, navigate]);

  // Function to save payment (only on the first click)
  const savePayment = async () => {
    try {
      console.log("🔹 Saving payment for Booking ID:", bookingId);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL2}/payment/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            transactionId: checkoutId,
            bookingId,
            amount: amountToPay,
            method: "mpesa",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Save Payment Error:", errorData);
        throw new Error(errorData.error || "Failed to save payment record.");
      }

      console.log("✅ Payment saved successfully!");
      paymentSaved.current = true; // Mark payment as saved
    } catch (error) {
      console.error("🚨 Save Payment Error:", error);
      alert("❌ Failed to save payment. Try again.");
    }
  };

  // Function to check payment status and update the database
  const checkPaymentStatus = async () => {
    let paymentStatus = "pending";
    let transactionId = checkoutId;
    let completedAt = new Date().toISOString();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL3}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ CheckoutRequestID: checkoutId }),
        }
      );

      let statusData = {};

      if (response.ok) {
        statusData = await response.json();
        console.log("✅ Payment Status Response:", statusData);

        if (statusData.success) {
          paymentStatus = "completed";
          alert("✅ Payment successful! Check your email.");
        } else if (
          !statusData.success &&
          statusData.message
            ?.toLowerCase()
            .includes("request cancelled by user")
        ) {
          paymentStatus = "cancelled";
          alert("⚠️ Payment was cancelled by the user.");
        } else {
          alert("⏳ Payment is still pending. Try again later.");
        }

        transactionId = statusData.transactionId || checkoutId;
      } else {
        // Handle non-OK response (e.g., network or API errors)
        const errorData = await response.json();
        console.error("❌ Check Payment Status Error:", errorData);

        if (
          errorData.message?.toLowerCase().includes("request cancelled by user")
        ) {
          paymentStatus = "cancelled";
          alert("⚠️ Payment was cancelled.");
        } else {
          alert("⏳ Payment is still pending.");
        }
      }

      // Update payment status in the database
      await updatePaymentStatus(paymentStatus, transactionId, completedAt);

      if (paymentStatus === "completed") {
        navigate("/");
      }
    } catch (error) {
      console.error("🚨 Check Payment Status Error:", error);
      alert("❌ Payment verification failed. Try again later.");
    }
  };

  // Function to update payment status
  const updatePaymentStatus = async (status, transactionId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL2}/payment/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            checkoutId,
            status,
            transactionId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment record.");
      }

      console.log(`✅ Payment updated to: ${status}`);
      setMessage(`✅ Payment ${status}!`);
    } catch (error) {
      console.error("🚨 Update Payment Error:", error);
      alert("❌ Failed to update payment status.");
    }
  };

  // Main function triggered on "Confirm Payment" click
  const handleCompleteOrder = async () => {
    if (!checkoutId || !bookingId || !amountToPay) {
      alert("❌ Missing Checkout ID, Booking ID, or Amount. Cannot proceed.");
      return;
    }

    setLoading(true);

    try {
      if (!paymentSaved.current) {
        // Only save payment on the first click
        await savePayment();
      }

      // Always check payment status on every click
      await checkPaymentStatus();
    } catch (error) {
      console.error("🚨 Handle Payment Error:", error);
      alert("❌ An error occurred. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-options-container">
      <h2>{message || "Payment Status"}</h2>
      <p>
        Your payment is being processed. Click "Confirm Payment" to check the
        status.
      </p>

      <div className="button-group">
        <button
          className="complete-btn"
          onClick={handleCompleteOrder}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm Payment"}
        </button>
        <button className="cancel-btn" onClick={() => navigate("/")}>
          Cancel Booking
        </button>
      </div>
    </div>
  );
};

export default CompleteOrder;
