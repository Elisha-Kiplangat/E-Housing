import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./checkout.scss";
import { useLoaderData } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie

const Checkout = () => {
  const post = useLoaderData();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const isApartment = post.type === "apartment";
  const isHostel = post.type === "hostel";
  const [amountToPay, setAmountToPay] = useState(post.price);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [checkoutId, setCheckoutId] = useState(null); // Store Transaction ID

  useEffect(() => {
    if (isApartment) {
      // For apartments, keep the dates selectable but initialize to today
      setStartDate(new Date());
      setEndDate(new Date());
    } else if (isHostel) {
      // For hostels, set both dates to the current date
      const today = new Date();
      setStartDate(today);
      
      // Set end date to the end of the semester (e.g., 4 months from now)
      const semesterEnd = new Date(today);
      semesterEnd.setMonth(today.getMonth() + 1);
      setEndDate(semesterEnd);
      
      // For hostels, use fixed price
      setAmountToPay(post.price);
    } else {
      // For other property types
      setStartDate(new Date());
      setEndDate(new Date());
      setAmountToPay(post.price);
    }
  }, [isApartment, isHostel, post.price]);

  const calculateAmount = () => {
    if (!startDate || !endDate) return;
    
    if (isApartment) {
      // For apartments, calculate based on days
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      setAmountToPay(days * post.price);
    } else {
      // For hostels and other types, use fixed price
      setAmountToPay(post.price);
    }
  };

  useEffect(() => {
    calculateAmount();
  }, [startDate, endDate, post.price]);

  const saveBookingDetails = async (checkoutId) => {
    try {
      // Retrieve the user object from localStorage
      const userString = localStorage.getItem("user");

      if (!userString) {
        setMessage("User data not found. Please log in.");
        setMessageType("error");
        return;
      }

      // Parse the JSON string to extract the user object
      const user = JSON.parse(userString);
      const userId = user.id;

      if (!userId) {
        setMessage("User ID not found in the user data.");
        setMessageType("error");
        return;
      }

      const bookingDetails = {
        startDate,
        endDate,
        status: "pending",
        type: post.type,
        postId: post.id,
        userId,
        checkoutId, // Save checkoutId in the Booking model
      };

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/bookings",
        bookingDetails,
        {
          withCredentials: true 
        }
      );

      if (response.data && response.data.id) {
        setMessage("Booking details saved successfully.");
        setMessageType("success");
        return response.data.id; // Return the booking ID
      } else {
        setMessage("Failed to save booking details.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Failed to save booking details. Try again.");
      setMessageType("error");
    }
  };

  const handlePayment = async () => {
    setMessage("Processing payment...");
    setMessageType("processing");

    let formattedPhone = phone.trim();
    if (phone.startsWith("07") || formattedPhone.startsWith("011")) {
      formattedPhone = "254" + phone.substring(1);
    } else if (!phone.startsWith("254") || phone.length !== 12) {
      setMessage("Invalid phone number format.");
      setMessageType("error");
      return;
    }

    try {
      const paymentResponse = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/payment",
        {
          phone: formattedPhone,
          amount: amountToPay,
        }
      );

      if (paymentResponse.data && paymentResponse.data.CheckoutRequestID) {
        setMessage("Payment request sent. Check your phone.");
        setMessageType("success");

        const checkoutRequestId = paymentResponse.data.CheckoutRequestID;
        setCheckoutId(checkoutRequestId); // Update state (but don't rely on it immediately)

        console.log("Checkout Request ID:", checkoutRequestId); // Log the correct ID

        // Save booking details with checkoutRequestId
        const bookingId = await saveBookingDetails(checkoutRequestId);

        // Redirect to complete order page with correct checkoutRequestId
        setTimeout(() => {
          navigate("/completeOrder", {
            state: {
              checkoutId: checkoutRequestId,
              bookingId,
              amountToPay,
              phone,
            },
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

        {isApartment ? (
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
        ) : isHostel ? (
          <div className="date-inputs">
            {/* <p className="booking-info">
              <b>Booking Period:</b> From {startDate?.toLocaleDateString()} to {endDate?.toLocaleDateString()}
            </p> */}
            <p className="booking-note">
              Hostel bookings are for deposit only
            </p>
          </div>
        ) : null}

        <p className="amount">
          <b>Total Amount:</b> KSh. {amountToPay}
        </p>

        <div className="button-group">
          <button className="back-button" onClick={() => window.history.back()}>
            Back
          </button>
          <button
            className="confirm-button"
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