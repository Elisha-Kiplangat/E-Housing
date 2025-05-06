import { Link } from "react-router-dom";
import "./card.scss";
import { useSavedPosts } from "../../context/SavedPostsContext";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function Card({ item }) {

  const { savedPosts, toggleSave } = useSavedPosts();
  const currentUser = useContext(AuthContext);
  // const isSaved = savedPosts.has(item.id);

  return (
    <div className="card">
      <Link to={`/${item.id}`} className="imageContainer">
        <img src={item.images[0]} alt="" />
      </Link>
      <div className="textContainer">
      <div className="titleRow">
          <h2 className="title">
            <Link to={`/${item.id}`}>{item.title}</Link>
          </h2>
          {currentUser?.role !== "admin" && item.status && (
  <div className={`statusBadge ${item.status.toLowerCase()}`}>
    {item.status}
  </div>
)}
        </div>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <p className="price">Kshs. {item.price}</p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/disicon.png" alt="" />
              <span>{item.bathroom}km Distance</span>
            </div>
          </div>
          <div className="icons">
           
            <div className="icon" onClick={() => toggleSave(item.id)}
              style={{
                 backgroundColor: savedPosts.has(item.id) ? "#fece51" : "transparent",
                 padding: "5px", 
                 transition: "background-color 0.3s ease", 
               }}
             >
  <img src="/save.png" alt="Save" />
            </div>
            <div className="icon">
              <img src="/chat.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
