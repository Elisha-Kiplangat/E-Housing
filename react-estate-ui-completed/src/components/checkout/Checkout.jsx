import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./checkout.scss";
import { useLoaderData } from "react-router-dom";

const Checkout = () => {
  const post = useLoaderData();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const isApartment = post.type === "apartment";
  const [amountToPay, setAmountToPay] = useState(0);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!isApartment) {
      setStartDate(null);
      setEndDate(null);
      // amountToPay = post.price
    }
  }, [isApartment]);

  const calculateAmount = () => {
    if (!startDate || !endDate) return 0;
    const days = Math.ceil(endDate.getDate() - startDate.getDate());
    const amount = days * post.price;
    setAmountToPay(amount);
    // console.log(days);
  };
  useEffect(() => {
    calculateAmount();
  }, [startDate, endDate, post.price]);

  const handlePayment = async () => {
    try {
      const response = await axios.post("http://localhost:5000/stkpush", {
        phone,
        amount,
      });
      alert("Payment request sent! Check your phone.");
    } catch (error) {
      // console.error("Payment error", error);
      alert("Payment failed. Try again.");
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
            <b>Room:</b> {243}
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
          Total Amount: KSh.
          {post.type === "apartment" ? amountToPay : post.price}
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
      </div>
    </div>
  );
};

export default Checkout;
