import React, { useContext, useEffect, useState } from "react";
import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import apiRequest from "../../lib/apiRequest";
import Cookies from "js-cookie";
import { DarkModeContext } from "../../context/darkModeContext";
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";

const Datatable = ({ columns, searchQueryProp }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1]; // Get "users", "posts", or "bookings"
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext);

  const { data, loading, error } = useFetch(`/${path}`);
  const [list, setList] = useState([]);
  
  console.log(path);
  console.log("Data:", data);

  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      console.error("Error: Data is not an array or is null:", data);
      return;
    }

    // Ensure `_id` is mapped to `id` for `DataGrid`
    const formattedData = data.map((item, index) => ({
      ...item,
      id: item.id || `temp-id-${index}`,
    }));

    setList(formattedData);
  }, [data]);

  useEffect(() => {
    if (searchQueryProp) {
      const filteredData = data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQueryProp.toLowerCase())
        )
      );
      setList(filteredData);
    } else {
      setList(data);
    }
  }, [searchQueryProp, data]);

  const handleView = (id) => {
    if (path === "users") {
      navigate(`/users/search/${id}`); // Navigates to Single.jsx
    } else if (path === "posts") {
      navigate(`/posts/search/${id}`); // Navigates to SingleHouse.jsx
    } else if (path === "bookings") {
      navigate(`/bookings/search/${id}`); // Navigates to SingleBooking.jsx (assuming you have this component)
    } else {
      console.error("Unknown path, cannot determine where to navigate.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get("token");
      if (path === "users") {
        const response = await apiRequest.delete(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("User deleted:", response.data);
      } else if (path === "posts") {
        await apiRequest.delete(`/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (path === "bookings") {
        await apiRequest.delete(`/bookings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        console.error("Unknown path, cannot determine where to delete.");
      }
      setList((prevList) => prevList.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const actionColumn = {
    field: "action",
    headerName: "Action",
    width: 150,
    renderCell: (params) => (
      <div className="cellAction">
        <button className={`viewButton ${darkMode ? "dark" : "light"}`} onClick={() => handleView(params.row.id)}>
          View
        </button>
        <button className={`deleteButton ${darkMode ? "dark" : "light"}`} onClick={() => handleDelete(params.row.id)}>
          Delete
        </button>
      </div>
    ),
  };

  const displayedColumns = columns.length > 5 ? columns.slice(0, 5) : columns;
  const gridColumns = [...displayedColumns, actionColumn];

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
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <div className={`datatable ${darkMode ? "dark" : "light"}`}>
          <div className="datatableTitle">
            {path === "users" ? "Users" : path === "posts" ? "Properties" : "Bookings"}
            <button className="link" onClick={() => navigate(`/${path}/new`)}>
              Add New
            </button>
          </div>

          {loading ? (
            <p>Loading data...</p>
          ) : error ? (
            <p>Error fetching data</p>
          ) : (
            <div className="tableWrapper">
              <DataGrid
                className="datagrid"
                rows={list}
                columns={gridColumns}
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
  );
};

export default Datatable;