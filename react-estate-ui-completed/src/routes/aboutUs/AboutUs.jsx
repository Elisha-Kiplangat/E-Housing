import React from "react";
import "./AboutUs.scss";
// Replace with your image path

const AboutUs = () => {
  return (
    <div className="about-us">
      <div className="about-us__header">
        <h1>About Us</h1>
        <p>
          Welcome to E-Housing, your trusted partner in finding the perfect
          home.
        </p>
      </div>

      {/* Introduction Section */}
      <section className="about-us__introduction">
        <div className="introduction-left">
          <img
            src="./Apartment1.jpg"
            alt="Affordable Housing"
            className="introduction-image"
          />
          <h2>Making Housing Affordable for Kenyans</h2>
        </div>
        <div className="introduction-right">
          <p>
            The E-Housing portal is a solution supporting the Affordable Housing
            Program targeting delivery of decent and affordable housing to low
            and middle-income households. It aims to reduce the gap between
            demand and supply for housing in Kenya and provide the main
            component of a large framework established towards delivering
            200,000 Affordable Houses annually.
          </p>
          <h3>About the E-Housing Portal</h3>
          <p>
            The Housing Portal is a platform that connects individuals to the
            Affordable Housing Program & Housing Fund. It allows individuals to
            save towards home ownership and makes access to mortgages and the
            National Tenant Purchase Scheme more accessible online. Allocation
            of homes is also through the portal. The portal is accessible via
            USSD, mobile web, and a web portal.
          </p>
          <h3>About the Affordable Housing Program</h3>
          <p>
            The Affordable Housing Program creates enabling environment
            interventions that enhance supply and facilitate demand in the
            housing sector in the interest of making housing affordable to all
            Kenyans.
          </p>
        </div>
      </section>

      <div className="about-us__content">
        <section className="about-us__mission">
          <h2>Our Mission</h2>
          <p>
            At E-Housing, our mission is to provide affordable, comfortable, and
            secure housing solutions for urban dwellers and university students.
            We aim to simplify the process of finding a home by offering a wide
            range of options tailored to your needs.
          </p>
        </section>

        <section className="about-us__vision">
          <h2>Our Vision</h2>
          <p>
            Our vision is to become the leading housing platform in the region,
            connecting people with their ideal homes while fostering a sense of
            community and belonging.
          </p>
        </section>

        <section className="about-us__values">
          <h2>Our Values</h2>
          <ul>
            <li>
              <strong>Integrity:</strong> We are committed to honesty and
              transparency in all our dealings.
            </li>
            <li>
              <strong>Innovation:</strong> We continuously strive to improve our
              services through technology.
            </li>
            <li>
              <strong>Customer Focus:</strong> Your satisfaction is our top
              priority.
            </li>
            <li>
              <strong>Community:</strong> We believe in building strong,
              supportive communities.
            </li>
          </ul>
        </section>

        {/* Milestones Section */}
        <section className="about-us__milestones">
          <h2>Milestones</h2>
          <div className="milestones-grid">
            <div className="milestone">
              <span className="milestone-number">10</span>
              <span className="milestone-text">Projects completed</span>
            </div>
            <div className="milestone">
              <span className="milestone-number">334,152</span>
              <span className="milestone-text">Registered Applicants</span>
            </div>
            <div className="milestone">
              <span className="milestone-number">45,000</span>
              <span className="milestone-text">Home owners</span>
            </div>
            <div className="milestone">
              <span className="milestone-number">200+</span>
              <span className="milestone-text">MSMEs onboarded</span>
            </div>
          </div>
        </section>
      </div>

      <div className="about-us__footer">
        <p>Join us today and find your dream home with E-Housing!</p>
      </div>
    </div>
  );
};

export default AboutUs;
