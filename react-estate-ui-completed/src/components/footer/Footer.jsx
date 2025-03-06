import React from "react";
import "./footer.scss";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        {/* <div className="footer-top">
          <div className="brand">
            <h2>E-Housing</h2>
            <p>Find your perfect home with ease.</p>
          </div>
          <div className="links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/listings">Listings</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div className="contact">
            <h3>Contact Us</h3>
            <p>Email: support@ehousing.com</p>
            <p>Phone: +123 456 789</p>
            <p>Location: 123 Housing Street, NY</p>
          </div>
          <div className="socials">
            <h3>Follow Us</h3>
            <div className="icons">
              <a href="#">
                <FaFacebook />
              </a>
              <a href="#">
                <FaTwitter />
              </a>
              <a href="#">
                <FaInstagram />
              </a>
              <a href="#">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div> */}
        <div className="footer-bottom">
  <div className="footer-bottom-container">
    {/* Quick Links on the Left */}
    <div className="quick-links">
      <a href="#">Privacy Policy</a>
      <a href="#">Terms of Service</a>
      <a href="#">Support</a>
    </div>

    {/* Copyright in the Center */}
    <p>&copy; {new Date().getFullYear()} E-Housing. All rights reserved.</p>

    {/* Social Media Icons on the Right */}
    <div className="social-icons">
    <h3>Follow Us</h3>
            <div className="icons">
              <a href="#">
                <FaFacebook />
              </a>
              <a href="#">
                <FaTwitter />
              </a>
              <a href="#">
                <FaInstagram />
              </a>
              <a href="#">
                <FaLinkedin />
              </a>
            </div>
    </div>
  </div>
</div>

      </div>
    </footer>
  );
};

export default Footer;
