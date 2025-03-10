import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import List from "../../components/table/Table";
import apiRequest from "../../lib/apiRequest";
import useFetch from "../../hooks/useFetch";
import Cookies from "js-cookie";

const Single = () => {
  const { Id } = useParams();
  const { data, loading, error } = useFetch(`/users/${Id}`);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  // const [edited, setEdited] = useState({});

  useEffect(() => {
    if (data) {
      setUser(data);
      // setEdited(data);
      console.log("User Data:", data);
    }
  }, [data]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, email: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userReq = {
        username: user.username,
        email: user.email,
        role: user.role,
       };
      const token = Cookies.get("token");
      // console.log("Token:", token);
      // console.log("User:", userReq);
      const response = await apiRequest.put(`/users/${Id}`, userReq, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("User updated:", response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
    setSaving(false);
  };

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />

        {loading ? (
          <p className="loading">Loading user details...</p>
        ) : error ? (
          <p className="error">Error: {error}</p>
        ) : user ? (
          <div className="singleContent">
            <div className="top">
              <div className="left">
                <div className="editButton" onClick={isEditing ? handleSave : handleEditToggle} disabled={saving}>
                  {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
                </div>
                <h1 className="title">Information</h1>
                <div className="item">
                  <img
                    src={user.avatar || "/default-image-url.jpg"}
                    alt={user.username || "User"}
                    className="itemImg"
                  />
                  <div className="details">
                    {isEditing ? (
                      <input type="text" value={user.username || ""} onChange={(e) => setUser({ ...user, username: e.target.value })} />
                    ) : (
                      <h2 className="itemTitle">{user.username || "N/A"}</h2>  
                    )}
                    <div className="detailItem">
                      <span className="itemKey">Email:</span>
                      {isEditing ? (
                        <input type="text" value={user.email || ""} onChange={handleChange} />
                      ) : (
                        <span className="itemValue">{user.email || "N/A"}</span>
                      )}
                    </div>
                    <div className="detailItem">
                      <span className="itemKey">Role:</span>
                      {isEditing ? (
                        <select value={user.role || ""} onChange={(e) => setUser({ ...user, role: e.target.value })}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="itemValue">{user.role || "N/A"}</span>
                      )}
                      </div>
                    <div className="detailItem">
                      <span className="itemKey">Registered at:</span>
                      <span className="itemValue">{new Date(user.createdAt).toLocaleDateString() || "N/A"}</span>
                    </div>
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
        ) : (
          <p className="error">User not found!</p>
        )}
      </div>
    </div>
  );
};

export default Single;
