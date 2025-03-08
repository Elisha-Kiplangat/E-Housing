import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./singleHouse.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Map from "../../components/map/Map";
import apiRequest from "../../lib/apiRequest";
import DOMPurify from "dompurify";

const SingleHouse = () => {
  const { Id } = useParams();
  const [house, setHouse] = useState(null);

  useEffect(() => {
    if (!Id) {
      console.error("House ID is undefined! Cannot fetch house.");
      return;
    }

    console.log("Fetching house with ID:", Id);

    const fetchHouse = async () => {
      try {
        const response = await apiRequest.get(`/posts/${Id}`);
        setHouse(response.data);
        console.log("House Data:", response.data);
      } catch (error) {
        console.error("Failed to fetch house details:", error);
      }
    };

    fetchHouse();
  }, [Id]);

  if (!house) return <p>Loading...</p>;

  return (
    <div className="singleHouse">
      <Sidebar />
      <div className="singleHouseContainer">
        <Navbar />

        <div className="details">
            <div className="imageContainer">
              <img src={house.images[0]} alt="House" />
            </div>
            
            <div className="info">
              <div className="top">
                <div className="post">
                  <h1>{house.title}</h1>
                  <div className="address">
                    <span>{house.city}, </span>
                  
                    <span>{house.address}</span>
                  </div>
                  <div className="price">Kshs. {house.price}</div>
                </div>
              </div>
                
              <div className="bottomContainer">
                <div
                  className="leftSection"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(house.postDetail.desc),
                  }}
                ></div>
              </div>
          </div>
        </div>

        <div className="features">
          <div className="wrapper">
          <div className="user">
                  <img src={house.user.avatar} alt="" />
                  <span>{house.user.username}</span>
                  <p>The Owner</p>
                </div>
            <div className="listVertical">
            <p className="title">General</p>
              <div className="feature">
                <div className="featureText">
                  <span>Utilities</span>
                  <p>
                    {house.postDetail.utilities === "owner"
                      ? "Owner is responsible"
                      : "Tenant is responsible"}
                  </p>
                </div>
              </div>
              <div className="feature">
                <div className="featureText">
                  <span>Pet Policy</span>
                  <p>
                    {house.postDetail.pet === "allowed"
                      ? "Pets Allowed"
                      : "Pets not Allowed"}
                  </p>
                </div>
              </div>
              <div className="feature">
                <div className="featureText">
                  <span>Income Policy</span>
                  <p>{house.postDetail.income}</p>
                </div>
              </div>
            </div>

            <div className="sizes">
            <p className="title">Sizes</p>
              <div className="size">
                <div className="featureText">
                <span>Size</span>
                <p>{house.postDetail.size} sqft</p>
                </div>
              </div>
              <div className="size">
                <div className="featureText">
                <span> Bedroom</span>
                <p>{house.bedroom}</p>
                </div>
              </div>
              <div className="size">
                <div className="featureText">
                <span>Bathroom</span>
                <p>{house.bathroom}</p>
                </div>
              </div>
            </div>
            </div>

            <p className="title">Location</p>
            <div className="mapContainer">
              <Map items={[house]} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default SingleHouse;
