import "./payment.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import List from "../../components/table/Table";
import { useState } from "react";

const Payment = () => {

  const [searchQueryProp, setSearchQueryProp] = useState("");

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar setSearchQueryProp={setSearchQueryProp}/>
        <div className="datatableContainer">
          <div className="listTitle">Latest Transactions</div>
          <List searchQueryProp={searchQueryProp}/>
        </div>
      </div>
    </div>
  );
};

export default Payment;
