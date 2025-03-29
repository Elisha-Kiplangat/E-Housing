import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import useFetch from "../../hooks/useFetch";
import { useState } from "react";

const Featured = () => {
  // Fetch total payments
  const { data: totalData, loading: totalLoading, error: totalError } = useFetch("/payment/total");
  
  // Fetch payment stats
  const { data: statsData, loading: statsLoading, error: statsError } = useFetch("/payment/stats");
  
  // State for the target amount (could be stored in backend or set here)
  const [target] = useState(50000); // Set your target amount (e.g., 50,000)
  
  // Calculate percentage of target achieved
  const percentageOfTarget = totalData ? Math.round((totalData / target) * 100) : 0;
  
  // Format currency values
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "Loading...";
    
    // Format to show "k" for thousands
    if (amount >= 1000) {
      return `Ksh. ${(amount / 1000).toFixed(1)}k`;
    }
    return `Ksh. ${amount}`;
  };

  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Total Revenue</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar 
            value={percentageOfTarget > 100 ? 100 : percentageOfTarget} 
            text={`${percentageOfTarget}%`} 
            strokeWidth={5} 
          />
        </div>
        <p className="title">Total payment made</p>
        <p className="amount">
          {totalLoading ? "Loading..." : totalError ? "Error loading data" : `Ksh. ${totalData}`}
        </p>
        <p className="desc">
          Previous transactions processing. Last payments may not be included.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Target</div>
            <div className="itemResult negative">
              <KeyboardArrowDownIcon fontSize="small" />
              <div className="resultAmount">
                {formatCurrency(target)}
              </div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Week</div>
            <div className="itemResult positive">
              {statsLoading ? (
                "Loading..."
              ) : statsError ? (
                "Error"
              ) : (
                <>
                  {statsData?.weeklyChange >= 0 ? (
                    <KeyboardArrowUpOutlinedIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowDownIcon fontSize="small" />
                  )}
                  <div className="resultAmount">
                    {formatCurrency(statsData?.weeklyAmount)}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Month</div>
              <div className={`itemResult ${statsData?.percentChange >= 0 ? "positive" : "negative"}`}>
                {statsLoading ? (
                  "Loading..."
                ) : statsError ? (
                  "Error"
                ) : (
                  <>
                    {statsData?.percentChange >= 0 ? (
                      <KeyboardArrowUpOutlinedIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowDownIcon fontSize="small" />
                    )}
                    <div className="resultAmount">
                      {formatCurrency(statsData?.newAmount)}
                    </div>
                  </>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;