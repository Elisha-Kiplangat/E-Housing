import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import List from "../../components/table/Table";
import apiRequest from "../../lib/apiRequest";

const Single = () => {
  const { Id } = useParams(); // Get ID from URL
  const [user, setUser] = useState(null);

  // const params = useParams();
  // console.log("Params:", params); 

  useEffect(() => {
    if (!Id) {
      console.error("ID is undefined! Cannot fetch user.");
      return;
    }

    // console.log("Fetching user with ID:", Id);

    const fetchUser = async () => {
      try {
        const response = await apiRequest.get(`/users/${Id}`);
        setUser(response.data);
        // console.log("User Data:", response.data);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };

    fetchUser();
  }, [Id]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <div className="editButton">Edit</div>
            <h1 className="title">Information</h1>
            <div className="item">
              <img
                src={user.avatar || "default-image-url.jpg"}
                alt={user.name}
                className="itemImg"
              />
              <div className="details">
                <h2 className="itemTitle">{user.username}</h2>
                <div className="detailItem">
                  <span className="itemKey">Email:</span>
                  <span className="itemValue">{user.email}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Role:</span>
                  <span className="itemValue">{user.role}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Registered at:</span>
                  <span className="itemValue">{user.createdAt}</span>
                </div>
                {/* <div className="detailItem">
                  <span className="itemKey">Country:</span>
                  <span className="itemValue">{user.country}</span>
                </div> */}
              </div>
            </div>
          </div>
          <div className="right">
            <Chart aspect={3 / 1} title="User Spending (Last 6 Months)" />
          </div>
        </div>
        <div className="bottom">
          <h1 className="title">Last Transactions</h1>
          <List />
        </div>
      </div>
    </div>
  );
};

export default Single;
