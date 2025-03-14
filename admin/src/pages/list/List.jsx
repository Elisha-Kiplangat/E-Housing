import "./list.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable from "../../components/datatable/Datatable";
import { useState } from "react";

const List = ({ columns }) => {

  const [searchQueryProp, setSearchQueryProp] = useState("");

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar setSearchQueryProp={setSearchQueryProp}/>
        {/* <Datatable columns={columns} /> */}
        <div className="datatableContainer">
          <Datatable columns={columns} searchQueryProp={searchQueryProp} />
        </div>
      </div>
    </div>
  );
};

export default List;
