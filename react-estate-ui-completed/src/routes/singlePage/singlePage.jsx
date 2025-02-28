import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import Checkout from "../../components/checkout/Checkout";

import { useSavedPosts } from "../../context/SavedPostsContext";

function SinglePage() {
  const post = useLoaderData();
  // const [saved, setSaved] = useState(post.isSaved);
  const { savedPosts, toggleSave } = useSavedPosts();
  // const isSaved = savedPosts.has(post.id);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false); // State for popup form

  //  const handleSave = () => {
  //   if (!currentUser) {
  //     navigate("/login");
  //     return;
  //   }
  //   toggleSave(post.id);
  // };

  const handleReserveClick = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setIsBookingFormOpen(true); 
  };

  const handleCloseForm = () => {
    setIsBookingFormOpen(false); 
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">Kshs. {post.price}</div>
              </div>
              <div className="user">
                <img src={post.user.avatar} alt="" />
                <span>{post.user.username}</span>
                <p>The Owner</p>
              </div>
            </div>
            <div className="bottomContainer">
              <div
                className="leftSection"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.postDetail.desc),
                }}
              ></div>
              <div className="rightSection">
                <button className="reserveButton" onClick={handleReserveClick}>
                  Reserve or Book Now!
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Modal */}
        {isBookingFormOpen && <div className="overlay" onClick={handleCloseForm}></div>}

        <div className="checkout">

        {isBookingFormOpen && (
          <div className="bookingModal">
            <div className="bookingContent">
              <button className="closeButton" onClick={handleCloseForm}>
                ✖
              </button>
            </div>
              <Checkout post={post} />
          </div>
        )}
        </div>
      </div>

      <div className="features">
        <div className="wrapper">
          <div className="available">
            <p>ROOMS: Available</p>
            <div className="rooms">
              <label htmlFor="type">Available Rooms</label>
              <select name="availableRooms" id="availableRooms">
                <option value="">314D</option>
                <option value="hostel">512A</option>
                <option value="apartment">512B</option>
              </select>
            </div>
          </div>

          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                <p>
                  {post.postDetail.utilities === "owner"
                    ? "Owner is responsible"
                    : "Tenant is responsible"}
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                <p>
                  {post.postDetail.pet === "allowed"
                    ? "Pets Allowed"
                    : "Pets not Allowed"}
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>

          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>

          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>

          <div className="buttons">
            <button>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>
            
        <button
              onClick={() => toggleSave(post.id)}
              style={{ backgroundColor: savedPosts.has(post.id) ? "#fece51" : "white" }}
            >
              <img src="/save.png" alt="Save" />
              {savedPosts.has(post.id) ? "Place Saved" : "Save the Place"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
