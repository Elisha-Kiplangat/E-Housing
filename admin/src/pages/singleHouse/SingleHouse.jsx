import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./singleHouse.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Map from "../../components/map/Map";
import useFetch from "../../hooks/useFetch";
import apiRequest from "../../lib/apiRequest";
import Cookies from "js-cookie";

const SingleHouse = () => {
  const { Id } = useParams();
  const { data, loading, error } = useFetch(`/posts/${Id}`);
  const [house, setHouse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setHouse(data);
      setEditedData(data);
    }
  }, [data]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => {
      const [mainKey, subKey] = name.split('.');
      if (subKey) {
        return {
          ...prev,
          [mainKey]: {
            ...prev[mainKey],
            [subKey]: value,
          },
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const requestData = {
        postData: {
          title: editedData.title,
          price: parseInt(editedData.price, 10),
          city: editedData.city,
          address: editedData.address,
          latitude: editedData.latitude,
          longitude: editedData.longitude,
          type: editedData.type,
          property: editedData.property,
          bathroom: parseInt(editedData.bathroom, 10),
          bedroom: parseInt(editedData.bedroom, 10)
        },
        postDetail: {
          desc: editedData.postDetail?.desc,
          size: parseInt(editedData.postDetail?.size, 10),
          utilities: editedData.postDetail?.utilities,
          pet: editedData.postDetail?.pet,
          income: editedData.postDetail?.income,
        },
      };
      console.log(requestData);
      const token = Cookies.get('token');
      const response = await apiRequest.put(`/posts/${Id}`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        setHouse(editedData);
        setIsEditing(false);
        console.log("Update successful:", editedData);
      } else {
        console.error("Failed to update house details:", response.status, response.data);
      }
    } catch (error) {
      console.error("Failed to update house details:", error);
    }
    setSaving(false);
  };

  return (
    <div className="singleHouse">
      <Sidebar />
      <div className="singleHouseContainer">
        <Navbar />

        {loading ? (
          <p className="loading">Loading house details...</p>
        ) : error ? (
          <p className="error">Error fetching data</p>
        ) : house ? (
          <div className="houseContainer">
            <div className="details">
              <div className="imageContainer">
                <img src={house.images?.[0] || "/default-house.jpg"} alt="House" />
              </div>

              <div className="info">
                <div className="top">
                  <div className="post">
                    {isEditing ? (
                      <input type="text" name="title" value={editedData.title} onChange={handleChange} />
                    ) : (
                      <h1>{house.title || "No Title"}</h1>
                    )}
                    <div className="address">
                      {isEditing ? (
                        <>
                          <input type="text" name="city" value={editedData.city} onChange={handleChange} />
                          <input type="text" name="address" value={editedData.address} onChange={handleChange} />
                        </>
                      ) : (
                        <>
                          <span>{house.city || "Unknown City"}, </span>
                          <span>{house.address || "No Address"}</span>
                        </>
                      )}
                    </div>
                    <div className="price">
                      {isEditing ? (
                        <input type="number" name="price" value={editedData.price} onChange={handleChange} />
                      ) : (
                        `Kshs. ${house.price || "N/A"}`
                      )}
                    </div>
                    <div className="type">
                      {isEditing ? (
                        <input type="text" name="type" value={editedData.type} onChange={handleChange} />
                      ) : (
                        `${house.type || "N/A"}`
                      )}
                    </div>
                  </div>
                </div>

                <div className="bottomContainer">
                  <div className="leftSection">
                  {isEditing ? (
                    <textarea
                      name="postDetail.desc"
                      value={editedData.postDetail?.desc}
                      onChange={handleChange}
                    ></textarea>
                  ) : (
                    <p>{house.postDetail?.desc || "No description"}</p>
                  )

                  }
                  </div>
                </div>
              </div>
              <div className="editButtonContainer">
                <button className="editButton" onClick={isEditing ? handleSave : handleEditToggle} disabled={saving}>
                  {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
                </button>
              </div>
            </div>

            <div className="features">
              <div className="wrapper">
                <div className="user">
                  <img src={house.user?.avatar || "/default-user.jpg"} alt="Owner" />
                  <span>{house.user?.username || "Unknown User"}</span>
                  <p>The Owner</p>
                </div>

                <div className="listVertical">
                  <p className="title">General</p>
                  <div className="feature">
                    <div className="featureText">
                      <span>Utilities</span>
                      {isEditing ? (
                        <select name="postDetail.utilities" value={editedData.postDetail?.utilities} onChange={handleChange}>
                          <option value="owner">Owner is responsible</option>
                          <option value="tenant">Tenant is responsible</option>
                        </select>
                      ) : (
                        <p>
                          {house.postDetail?.utilities === "owner"
                            ? "Owner is responsible"
                            : "Tenant is responsible"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="feature">
                    <div className="featureText">
                      <span>Pet Policy</span>
                      {isEditing ? (
                        <select name="postDetail.pet" value={editedData.postDetail?.pet} onChange={handleChange}>
                          <option value="allowed">Pets Allowed</option>
                          <option value="notAllowed">Pets not Allowed</option>
                        </select>
                      ) : (
                        <p>
                          {house.postDetail?.pet === "allowed"
                            ? "Pets Allowed"
                            : "Pets not Allowed"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="feature">
                    <div className="featureText">
                      <span>Income Policy</span>
                      {isEditing ? (
                        <input type="text" name="postDetail.income" value={editedData.postDetail?.income} onChange={handleChange} />
                      ) : (
                        <p>{house.postDetail?.income}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sizes">
                  <p className="title">Sizes</p>
                  <div className="size">
                    <div className="featureText">
                      <span>Size</span>
                      {isEditing ? (
                        <input type="number" name="postDetail.size" value={editedData.postDetail?.size || ""} onChange={handleChange} />
                      ) : (
                        <p>{house.postDetail?.size || "N/A"} sqft</p>
                      )}
                    </div>
                  </div>
                  <div className="size">
                    <div className="featureText">
                      <span>Bedroom</span>
                      {isEditing ? (
                        <input type="number" name="bedroom" value={editedData.bedroom || ""} onChange={handleChange} />
                      ) : (
                        <p>{house.bedroom || "N/A"}</p>
                      )}
                    </div>
                  </div>
                  <div className="size">
                    <div className="featureText">
                      <span>Bathroom</span>
                      {isEditing ? (
                        <input type="number" name="bathroom" value={editedData.bathroom || ""} onChange={handleChange} />
                      ) : (
                        <p>{house.bathroom || "N/A"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="title">Location</p>
              <div className="mapContainer">
                <div className="coordinates">
                  {isEditing ? (
                    <>
                      <input type="text" name="latitude" value={editedData.latitude} onChange={handleChange} />
                      <input type="text" name="longitude" value={editedData.longitude} onChange={handleChange} />
                    </>
                  ) : (
                    <>
                      <span>Latitude: {house.latitude ?? "N/A"}</span>
                      <span>Longitude: {house.longitude ?? "N/A"}</span>
                    </>
                  )}
                </div>
                <Map items={[house]} />
              </div>
            </div>
          </div>
        ) : (
          <p className="error">No house found</p>
        )}
      </div>
    </div>
  );
};

export default SingleHouse;