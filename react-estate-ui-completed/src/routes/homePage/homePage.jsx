import React, { useContext, useEffect } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import FeaturedHome from "../../components/featuredHome/FeaturedHome";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";

function HomePage() {
  const { currentUser } = useContext(AuthContext);

  // Scroll effect for overlay
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        document.querySelector(".homePage")?.classList.add("scrolled");
      } else {
        document.querySelector(".homePage")?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="homePage">
      {/* Overlay effect when scrolling */}
      <div className="overlay"></div>

      <div className="contentContainer">
        {/* Text Container on the Left */}
        <div className="textContainer">
          <div className="wrapper">
            <h1 className="title">Find Real Estate & Get Your Dream Place</h1>
            <p>
              Discover the best real estate options for your dream home. Whether
              you’re looking for a cozy apartment, a spacious house, or a luxury
              villa, we have the perfect match for you!
            </p>
            <SearchBar />
            <div className="boxes">
              <div className="box">
                <h1>16+</h1>
                <h2>Home Owners</h2>
              </div>
              <div className="box">
                <h1>200</h1>
                <h2>Agents</h2>
              </div>
              <div className="box">
                <h1>2000+</h1>
                <h2>Registered Users</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Image Container on the Right */}
        <div className="imgContainer">
          <img src="/bg.png" alt="Real Estate Background" />
        </div>
      </div>

      {/* Featured Home Section */}
      <div className="featuredContainer">
        <FeaturedHome />
      </div>
    </div>
  );
}

export default HomePage;
