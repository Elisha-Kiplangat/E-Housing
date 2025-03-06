import React, { useEffect, useState } from "react";
import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import axios from "axios";

const Datatable = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  const { data = [], loading, error } = useFetch(`/${path}`);
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(data || []);
  }, [data]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/${path}/${id}`);
      setList((prevList) => prevList.filter((item) => item._id !== id));
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
        <Link to={`/users/${params.row._id}`} className="viewButton">
          View
        </Link>
        <button className="deleteButton" onClick={() => handleDelete(params.row._id)}>
          Delete
        </button>
      </div>
    ),
  };

  const displayedColumns = columns.length > 5 ? columns.slice(0, 5) : columns;
  const gridColumns = [...displayedColumns, actionColumn];

  const rows = list.map((row, index) => ({
    ...row,
    id: row.id || `temp-id-${index}`,
  }));

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {path}
        <Link to={`/${path}/new`} className="link">
          Add New
        </Link>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error fetching data</p>
      ) : (
        <div className="tableWrapper">
          <DataGrid
            className="datagrid"
            rows={rows}
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
  );
};

export default Datatable;
