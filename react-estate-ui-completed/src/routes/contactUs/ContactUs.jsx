import "./ContactUs.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faComment } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
// import image from "../../../public/contact.jpg";

const ContactUs = () => {
  const [isMobile, setIsMobile] = useState(false);
  const phoneNumber = "0741048174";
  const whatsappNumber = "254741048174"; // Kenya country code (254) + number without leading 0

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);
    
    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Handle phone call button click
  const handleCallClick = () => {
    window.location.href = `tel:${phoneNumber}`;
  };
  
  // Handle WhatsApp chat button click
  const handleChatClick = () => {
    window.open(`https://wa.me/${whatsappNumber}`, "_blank");
  };

  return (
    <div className="contact">
      {/* <div className="container"> */}
        <div className="banner">
          <img src="./contact.jpg" alt="Contact Us" />
          <div className="overlay">
            <h2>Contact Us</h2>
            <p>Have questions? Get in touch with us!</p>
          </div>
        </div>

        {isMobile && (
          <div className="mobileActions">
            <button 
              className="actionButton callButton" 
              onClick={handleCallClick}
            >
              <FontAwesomeIcon icon={faPhone} />
              <span>Call Us</span>
            </button>
            <button 
              className="actionButton chatButton" 
              onClick={handleChatClick}
            >
              <FontAwesomeIcon icon={faComment} />
              <span>Chat with Us</span>
            </button>
          </div>
        )}

        <div className="formContainer">
          <div className="details">
            <div className="info">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>E-Housing, Kenya</span>
            </div>
            <div className="info">
              <FontAwesomeIcon icon={faPhone} />
              <span>{phoneNumber}</span>
            </div>
            <div className="info">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>info@ehousing.com</span>
            </div>
          </div>

          <div className="form">
            <input type="text" placeholder="Your Name" />
            <input type="email" placeholder="Your Email" />
            <textarea placeholder="Your Message"></textarea>
            <button type="submit">Send Message</button>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
};

export default ContactUs;