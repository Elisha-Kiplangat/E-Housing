import "./navbar.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
// import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
// import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
// import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNotificationStore } from "../../lib/notificationStore";
import Chat from "../chat/Chat.jsx";

const Navbar = ({ setSearchQueryProp }) => {
  const { dispatch } = useContext(DarkModeContext);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(AuthContext);
  const fetch = useNotificationStore((state) => state.fetch);
  const number = useNotificationStore((state) => state.number);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
    if (user) fetch();

    // console.log(user);

  useEffect(() => {
    if(setSearchQueryProp) {
      setSearchQueryProp(searchQuery);
    }
  }, [searchQuery, setSearchQueryProp]);

  const handleOpenChat = async () => {
    setIsChatOpen(true);
  }

  const handleCloseChat = () => {
    setIsChatOpen(false);
  }

  return (
    <>
    <div className="navbar">
      <div className="wrapper">
        <div className="search">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="searchButton">
              <SearchOutlinedIcon />
            </button>
        </div>
        <div className="items">
          {/* <div className="item">
            <LanguageOutlinedIcon className="icon" />
            English
          </div> */}
          <div className="item">
            <DarkModeOutlinedIcon
              className="icon"
              onClick={() => dispatch({ type: "TOGGLE" })}
            />
          </div>
          <div className="item">
            {/* <FullscreenExitOutlinedIcon className="icon" /> */}
          </div>
          <div className="item">
            <NotificationsNoneOutlinedIcon className="icon" />
            { number > 0 && <div className="counter">{number}</div> }
          </div>
          <div className="item" onClick={handleOpenChat}>
            <ChatBubbleOutlineOutlinedIcon className="icon" />
            { number > 0 && <div className="counter">{number}</div> }
          </div>
          <div className="item">
            {/* <ListOutlinedIcon className="icon" /> */}
          </div>
          <div className="item">
            <img
              src={user?.avatar || "/noavatar.jpg"}
              alt=""
              className="avatar"
            />
          </div>
        </div>
      </div>
    </div>
        {isChatOpen && <Chat handleCloseChat={handleCloseChat} />}
        </>
  );
};

export default Navbar;
