import "./table.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useMemo, useState, useContext } from "react";
import useFetch from "../../hooks/useFetch";
import Alert from '@mui/material/Alert';
import moment from 'moment';
import { CircularProgress } from "@mui/material";
import { DarkModeContext } from "../../context/darkModeContext";

const List = ({ searchQueryProp }) => {
  // Get the dark mode context
  const { darkMode } = useContext(DarkModeContext);
  
  // Fetch payment data from the API
  const { data, loading, error } = useFetch("/payment/");
  const [formattedData, setFormattedData] = useState([]);

  // Format the data once it's fetched
  useEffect(() => {
    if (data) {
      const formatted = data.map(payment => ({
        id: payment.id || payment.transactionId,
        postId: payment.booking?.postId || "Unknown Property",
        customer: payment.booking?.user?.username || "Unknown User",
        date: payment.createdAt ? moment(payment.createdAt).format('D MMM YYYY') : "Unknown Date",
        amount: payment.amount || 0,
        transactionId: payment.transactionId || "Unknown",
        status: payment.status || "Unknown",
      }));
      setFormattedData(formatted);
    }
  }, [data]);

  // Filter the data based on search query
  const filteredRows = useMemo(() => {
    if (!searchQueryProp) return formattedData;
    return formattedData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchQueryProp.toLowerCase())
      )
    );
  }, [searchQueryProp, formattedData]);

  // Render loading state
  if (loading) {
    return (
      <div className={`loadingContainer ${darkMode ? "dark" : "light"}`}>
        <CircularProgress />
        <p>Loading payment data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" className={darkMode ? "dark" : "light"}>
        Error loading payment data: {error.message || "Unknown error"}
      </Alert>
    );
  }

  // Render empty state
  if (!loading && filteredRows.length === 0) {
    return (
      <Alert severity="info" className={darkMode ? "dark" : "light"}>
        {searchQueryProp ? "No payments match your search criteria." : "No payment records found."}
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper} className={`table ${darkMode ? "dark" : "light"}`}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="tableCell">Tracking ID</TableCell>
            <TableCell className="tableCell">Customer</TableCell>
            <TableCell className="tableCell">Property</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Transaction ID</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="tableCell">{row.id}</TableCell>
              <TableCell className="tableCell">{row.customer}</TableCell>
              <TableCell className="tableCell"> {row.postId} </TableCell>
              <TableCell className="tableCell">{row.date}</TableCell>
              <TableCell className="tableCell">Ksh. {row.amount.toLocaleString()}</TableCell>
              <TableCell className="tableCell">{row.transactionId}</TableCell>
              <TableCell className="tableCell">
                <span className={`status ${row.status.toLowerCase()}`}>{row.status}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default List;