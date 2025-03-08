import React, { useEffect, useState } from "react";
import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import apiRequest from "../../lib/apiRequest";

const Datatable = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(`/${path}`);
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      console.error("Error: Data is not an array or is null:", data);
      return;
    }

    // Ensure `_id` is mapped to `id` for `DataGrid`
    const formattedData = data.map((item, index) => ({
      ...item,
      id: item.id || `temp-id-${index}`, // Ensures each row has an ID
    }));

    setList(formattedData);
  }, [data]);

  const handleView = async (id) => {
    try {
      // const response = await apiRequest.get(`/users/${id}`);
      // console.log("Fetched User Data:", response.data);
      navigate(`/users/search/${id}`); // Navigates to Single page
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiRequest.delete(`/${path}/${id}`);
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
        <button className="viewButton" onClick={() => handleView(params.row.id)}>
          View
        </button>
        <button className="deleteButton" onClick={() => handleDelete(params.row.id)}>
          Delete
        </button>
      </div>
    ),
  };

  const displayedColumns = columns.length > 5 ? columns.slice(0, 5) : columns;
  const gridColumns = [...displayedColumns, actionColumn];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {path}
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
            getRowId={(row) => row.id} // Ensure every row has a unique identifier
          />
        </div>
      )}
    </div>
  );
};

export default Datatable;
