import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import "./booking.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import useFetch from "../../hooks/useFetch";
import { CircularProgress } from "@mui/material";
import { DarkModeContext } from "../../context/darkModeContext";

const Booking = () => {
  const { Id } = useParams();
  const { data, loading, error } = useFetch(`/bookings/${Id}`);
  const [booking, setBooking] = useState(null);
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    if (data) {
      setBooking(data);
      console.log("Booking Data:", data);
    }
  }, [data]);

  // Format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="booking">
      <Sidebar />
      <div className="bookingContainer">
        <Navbar />

        {loading ? (
          <div className={`loadingContainer ${darkMode ? "dark" : "light"}`}>
            <CircularProgress />
            <p className="loading">Loading booking details...</p>
          </div>
        ) : error ? (
          <p className="error">Error: {error.message || "Failed to load booking details"}</p>
        ) : booking ? (
          <div className="bookingContent">
            <div className="top">
              <div className="left">
                <h1 className="title">Booking Information</h1>
                <div className="item">
                  <img
                    src={booking.post?.images?.[0] || "/house-placeholder.jpg"}
                    alt={booking.post?.title || "Property"}
                    className="itemImg"
                  />
                  <div className="details">
                    <h2 className="itemTitle">{booking.post?.title || "Unknown Property"}</h2>
                    
                    <div className="detailItem">
                      <span className="itemKey">Booking ID:</span>
                      <span className="itemValue">{booking.id || "N/A"}</span>
                    </div>
                    
                    <div className="detailItem">
                      <span className="itemKey">Status:</span>
                      <span className={`itemValue status ${booking.status}`}>
                        {booking.status || "N/A"}
                      </span>
                    </div>
                    
                    <div className="detailItem">
                      <span className="itemKey">Booking Start:</span>
                      <span className="itemValue">{formatDate(booking.startDate)}</span>
                    </div>
                    
                    <div className="detailItem">
                      <span className="itemKey">Booking End:</span>
                      <span className="itemValue">{formatDate(booking.endDate)}</span>
                    </div>
                    
                    <div className="detailItem">
                      <span className="itemKey">Booked by:</span>
                      <span className="itemValue">{booking.user?.username || "N/A"}</span>
                    </div>
                    
                    <div className="detailItem">
                      <span className="itemKey">User Email:</span>
                      <span className="itemValue">{booking.user?.email || "N/A"}</span>
                    </div>
                    
                    <div className="detailItem">
                      <span className="itemKey">Created at:</span>
                      <span className="itemValue">{formatDate(booking.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="right">
                <div className="paymentInfo">
                  <h2>Payment Information</h2>
                  {booking.payment ? (
                    <div className="paymentDetails">
                      <div className="detailItem">
                        <span className="itemKey">Payment Status:</span>
                        <span className={`itemValue status ${booking.payment.status}`}>
                          {booking.payment.status || "N/A"}
                        </span>
                      </div>
                      <div className="detailItem">
                        <span className="itemKey">Transaction ID:</span>
                        <span className="itemValue">{booking.payment.transactionId || "N/A"}</span>
                      </div>
                      <div className="detailItem">
                        <span className="itemKey">Amount:</span>
                        <span className="itemValue">
                          Ksh. {booking.payment.amount?.toLocaleString() || "N/A"}
                        </span>
                      </div>
                      <div className="detailItem">
                        <span className="itemKey">Payment Date:</span>
                        <span className="itemValue">{formatDate(booking.payment.createdAt)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="noPayment">No payment information available</p>
                  )}
                </div>
              </div>
            </div>
            <div className="bottom">
              <h1 className="title">Property Details</h1>
              {booking.post ? (
                <div className="propertyDetails">
                  <div className="property-info-grid">
                    <div className="property-info-item">
                      <span className="label">Title:</span>
                      <span className="value">{booking.post.title}</span>
                    </div>
                    <div className="property-info-item">
                      <span className="label">Price:</span>
                      <span className="value">Ksh. {booking.post.price?.toLocaleString()}</span>
                    </div>
                    <div className="property-info-item">
                      <span className="label">Address:</span>
                      <span className="value">{booking.post.address}</span>
                    </div>
                    <div className="property-info-item">
                      <span className="label">Bedrooms:</span>
                      <span className="value">{booking.post.bedroom}</span>
                    </div>
                    <div className="property-info-item">
                      <span className="label">Bathrooms:</span>
                      <span className="value">{booking.post.bathroom}</span>
                    </div>
                    <div className="property-info-item">
                      <span className="label">Type:</span>
                      <span className="value">{booking.post.type}</span>
                    </div>
                  </div>
                  <div className="property-description">
                    <h3>Description</h3>
                    <p>{booking.post.desc}</p>
                  </div>
                </div>
              ) : (
                <p className="error">Property details not available</p>
              )}
            </div>
          </div>
        ) : (
          <p className="error">Booking not found!</p>
        )}
      </div>
    </div>
  );
};

export default Booking;