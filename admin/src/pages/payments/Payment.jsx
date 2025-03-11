import "./payment.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import List from "../../components/table/Table";

const Payment = ({ columns }) => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <div className="datatableContainer">
          <div className="listTitle">Latest Transactions</div>
          <List />
        </div>
      </div>
    </div>
  );
};

export default Payment;
