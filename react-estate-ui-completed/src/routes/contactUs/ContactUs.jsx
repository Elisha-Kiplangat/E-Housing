import "./ContactUs.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import image from "../../../public/chat.png";

const ContactUs = () => {
  return (
    <div className="contact">
      <div className="container">
        <div className="banner">
          <img src={image} alt="Contact Us" />
          <div className="overlay">
            <h2>Contact Us</h2>
            <p>Have questions? Get in touch with us!</p>
          </div>
        </div>

        <div className="formContainer">
          <div className="details">
            <div className="info">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>E-Housing, Kenya</span>
            </div>
            <div className="info">
              <FontAwesomeIcon icon={faPhone} />
              <span>+254 7121212121</span>
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
      </div>
    </div>
  );
};

export default ContactUs;