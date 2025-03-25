import { useState, useEffect, useContext } from "react";
import "./profile.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import apiRequest from "../../lib/apiRequest";
import Cookies from "js-cookie";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext"; // Import the dark mode context
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const id = user?.id;

  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext); // Access dark mode state

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiRequest.get(`/users/${id}`);
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    } else {
      console.error("No user ID found in localStorage");
      setLoading(false);
    }
  }, [id]);

  // Fetch posts created by the logged-in admin
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await apiRequest.get(`/posts`);

        if (Array.isArray(res.data)) {
          const adminPosts = res.data.filter((post) => post.userId === id);
          setPosts(adminPosts);
        } else {
          console.error("Unexpected response format:", res.data);
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setFetchError(err.message);
        setPosts([]);
      }
    };

    if (id) {
      fetchPosts();
    }
  }, [id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setUserData((prev) => ({ ...prev, email: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userReq = {
        username: userData.username,
        email: userData.email,
        role: userData.role,
      };
      const token = Cookies.get("token");

      await apiRequest.put(`/users/${id}`, userReq, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user:", error);
      setFetchError(error.message);
    }
    setSaving(false);
  };

  const handleView = (postId) => {
    navigate(`/posts/search/${postId}`);
  };

  const handleDelete = async (postId) => {
    try {
      const token = Cookies.get("token");
      await apiRequest.delete(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "title", headerName: "Title", width: 200 },
    { field: "price", headerName: "Price", width: 150 },
    { field: "address", headerName: "Address", width: 250 },
    { field: "city", headerName: "City", width: 150 },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <div className="cellAction">
          <button className="viewButton" onClick={() => handleView(params.row.id)}>
            View
          </button>
          <button className="deleteButton" onClick={() => handleDelete(params.row.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

   // Create a dark theme
    const darkTheme = createTheme({
      palette: {
        mode: "dark",
      },
      components: {
        MuiDataGrid: {
          styleOverrides: {
            root: {
              backgroundColor: "#121212",
              color: "#ffffff",
            },
          },
        },
      },
    });
  
    // Create a light theme
    const lightTheme = createTheme({
      palette: {
        mode: "light",
      },
      components: {
        MuiDataGrid: {
          styleOverrides: {
            root: {
              backgroundColor: "#ffffff",
              color: "#000000",
            },
          },
        },
      },
    });

  return (
    <div className={`profile ${darkMode ? "dark" : "light"}`}> {/* Apply dark or light mode */}
      <Sidebar />
      <div className="profileContainer">
        <Navbar />

        {loading ? (
          <div className={`loadingContainer ${darkMode ? "dark" : "light"}`}>
                      <CircularProgress />
                      <p className="loading">Loading user details...</p>
                    </div>
        ) : error ? (
          <p className="error">Error: {error.message}</p>
        ) : userData ? (
          <div className="profileContent">
            <div className="top">
              <div className="editButton" onClick={isEditing ? handleSave : handleEditToggle} disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
              </div>
              <h1 className="title">Profile Information</h1>
              <div className="item">
                <img
                  src={userData.avatar || "/default-image-url.jpg"}
                  alt={userData.username || "User"}
                  className="itemImg"
                />
                <div className="details">
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.username || ""}
                      onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                    />
                  ) : (
                    <h2 className="itemTitle">{userData.username || "N/A"}</h2>
                  )}
                  <div className="detailItem">
                    <span className="itemKey">Email:</span>
                    {isEditing ? (
                      <input type="text" value={userData.email || ""} onChange={handleChange} />
                    ) : (
                      <span className="itemValue">{userData.email || "N/A"}</span>
                    )}
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Role:</span>
                    {isEditing ? (
                      <select
                        value={userData.role || ""}
                        onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="itemValue">{userData.role || "N/A"}</span>
                    )}
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Registered at:</span>
                    <span className="itemValue">{new Date(userData.createdAt).toLocaleDateString() || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Posts Created by the Admin */}
            <StyledEngineProvider injectFirst>
                  <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <div className={`bottom ${darkMode ? "dark" : "light"}`}>
              <h1 className="title">Posts Created</h1>
              {fetchError ? (
                <p className="error">Error: {fetchError}</p>
              ) : (
                <div className="tableWrapper">
                  <DataGrid
                    className="datagrid"
                    rows={posts}
                    columns={columns}
                    pageSize={9}
                    rowsPerPageOptions={[9]}
                    checkboxSelection
                    autoHeight
                    getRowId={(row) => row.id}
                  />
                </div>
              )}
            </div>
            </ThemeProvider>
            </StyledEngineProvider>
          </div>
        ) : (
          <p className="error">User not found!</p>
        )}
      </div>
    </div>
  );
};

export default Profile;