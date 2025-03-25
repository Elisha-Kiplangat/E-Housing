import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import useFetch from "../../hooks/useFetch";
import { Link } from "react-router-dom";

const Widget = ({ type }) => {
  let data;
  

  const apiUrl = type === "user"
    ? "/users/count"
    : type === "landlord"
    ? "/users/landlords"
    : type === "property"
    ? "/posts/count"
    : type === "booking"
    ? "/bookings/count"
    : null;

    const statsUrl = type === "user"
    ? "/users/stats"
    : type === "landlord"
    ? "/users/landlord-stats"
    : type === "property"
    ? "/posts/stats"
    : type === "booking"
    ? "/bookings/stats"
    : null;

  const { data: apiData, loading, error } = useFetch(apiUrl);
  const { data: statsData, loading: statsLoading, error: statsError } = useFetch(statsUrl);

  // Extract percentage change from stats data
  const percentChange = statsData?.percentChange || 0;
  const isPositive = percentChange >= 0;


  switch (type) {
    case "user":
      data = {
        title: "USERS",
        isMoney: false,
        link: (
          <Link to="/users" style={{ textDecoration: "none", color: "blue" }}>
            See all users
          </Link>
        ),
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
            }}
          />
        ),
      };
      break;
      case "landlord":
      data = {
        title: "LANDLORDS",
        isMoney: false,
        link: (
          <Link to="/users" style={{ textDecoration: "none", color: "blue" }}>
            See all users
            </Link>
        ),
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(128, 0, 128, 0.2)",
              color: "purple",
            }}
          />
        ),
      };
      break;
    case "property":
      data = {
        title: "PROPERTIES",
        isMoney: false,
        link: (
          <Link to="/posts" style={{ textDecoration: "none", color: "blue" }}>
            View all properties
            </Link>
            ),
        icon: (
          <ApartmentOutlinedIcon 
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
            }}
          />
        ),
      };
      break;
    case "booking":
      data = {
        title: "BOOKINGS",
        isMoney: false,
        link: (
          <Link to="/bookings" style={{ textDecoration: "none", color: "blue" }}>
            View all bookings
            </Link>
            ),
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    
    default:
      return null;
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.isMoney && "Ksh."} {loading ? "Loading..." : error ? "Error" : apiData}
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
      <div className={`percentage ${isPositive ? "positive" : "negative"}`}>
          {isPositive ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          {statsLoading ? "..." : statsError ? "N/A" : `${Math.abs(percentChange)}%`}
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
