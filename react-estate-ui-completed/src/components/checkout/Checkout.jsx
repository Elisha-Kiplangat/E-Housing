import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./checkout.scss";
import { useLoaderData } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
  const post = useLoaderData();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const isApartment = post.type === "apartment";
  const [amountToPay, setAmountToPay] = useState(post.price);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [transactionId, setTransactionId] = useState(null); // Store Transaction ID

  useEffect(() => {
    if (!isApartment) {
      setStartDate(null);
      setEndDate(null);
      setAmountToPay(post.price);
    }
  }, [isApartment, post.price]);

  const calculateAmount = () => {
    if (!startDate || !endDate) return;
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    setAmountToPay(days * post.price);
  };

  useEffect(() => {
    if (isApartment) {
      calculateAmount();
    }
  }, [startDate, endDate, post.price]);

  const handlePayment = async () => {
    setMessage("Processing payment...");
    setMessageType("processing");

    let formattedPhone = phone;
    if (phone.startsWith("07")) {
      formattedPhone = "254" + phone.substring(1);
    } else if (!phone.startsWith("254") || phone.length !== 12) {
      setMessage("Invalid phone number format.");
      setMessageType("error");
      return;
    }

    try {
      const response = await axios.post(
        import.meta.env.VITE_PAYMENT_URL + "/payment",
        {
          phone: formattedPhone,
          amount: amountToPay,
        }
      );

      if (response.data && response.data.CheckoutRequestID) {
        setMessage("Payment request sent. Check your phone.");
        setMessageType("success");

        // Store the Transaction ID
        setTransactionId(response.data.CheckoutRequestID);

        // Redirect to order options page after success
        setTimeout(() => {
          navigate("/completeOrder", {
            state: { transactionId: response.data.CheckoutRequestID },
          });
        }, 3000);
      } else {
        setMessage("Payment failed. Try again.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Payment request failed. Try again.");
      setMessageType("error");
    }
  };

  return (
    <div className="checkoutContainer">
      <div className="header">
        <h2>Checkout</h2>
      </div>
      <div className="booking-container">
        <div className="details">
          <h3>
            <b>{post.title}</b>
          </h3>
          <p>
            <b>Room:</b> 314D
          </p>
          <p>
            <b>Type:</b> {post.type}
          </p>
        </div>

        <div className="date-inputs">
          <label>Payment Number</label>
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            required
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {isApartment && (
          <div className="date-inputs">
            <label>Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              required
            />
            <label>End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={startDate || new Date()}
              required
            />
          </div>
        )}

        <p className="amount">
          <b>Total Amount:</b> KSh. {amountToPay}
        </p>

        <div className="button-group">
          <button className="back-button" onClick={() => window.history.back()}>
            Back
          </button>
          <button
            className="confirm-button"
            disabled={isApartment && (!startDate || !endDate)}
            onClick={handlePayment}
          >
            Confirm Booking
          </button>
        </div>

        {message && (
          <p className={`payment-message ${messageType}`}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Checkout;
