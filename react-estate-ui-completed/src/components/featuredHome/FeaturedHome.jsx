import React from "react";
import Slider from "react-slick";
import "./FeaturedHome.scss";

import { Link } from "react-router-dom";
import { useState } from "react";

// import { useState } from "react";
// import { Link } from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Sample images
const images = [
  "/Apartment1.jpg",
  "/Hostel.JPG",
  "/Apartment3.jpg",
  "/Apartment4.png",
];


const FeaturedHome = () => {
  const [query, setQuery] = useState({
    type: "apartment",
    city: "",
    minPrice: "",
    maxPrice: "",
  });
   
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <section className="featuredHome">
      <div className="sliderContainer">
        <Slider {...settings}>
          {images.map((img, index) => (
            <div key={index} className="imageSlide">
              <img src={img} alt={`House ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </div>

      <div className="textContainer">
        <h2>Find Your Dream Home</h2>
        <p>
          Explore our top listings for the best housing options. Whether you're
          looking for an apartment, a family home, or a luxury villa, we have it
          all.
        </p>
        <Link  to={`/list?type=${query.type}&city=${query.city}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`} >
        <button className="exploreBtn">Explore Now</button>
        </Link>
        <Link  to={`/list?type=${query.type}&city=${query.city}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`}><button className="exploreBtn">Explore Now</button></Link>
        
      </div>
    </section>
  );
};

export default FeaturedHome;
