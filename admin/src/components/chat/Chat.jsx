import React, { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import { format } from "timeago.js";
import { useNotificationStore } from "../../lib/notificationStore";
import apiRequest from "../../lib/apiRequest";
import { SocketContext } from "../../context/SocketContext";

function Chat({ handleCloseChat }) {
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState(null);
  const { user : currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const messageEndRef = useRef();

  const decrease = useNotificationStore((state) => state.decrease);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await apiRequest.get("/chats");
        setChats(res.data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleOpenChat = async (id) => {
    if (!currentUser || !currentUser.id) {
      console.log(currentUser)
      console.error("Current user is undefined or missing ID");
      return;
    }

    try {
      const res = await apiRequest.get(`/chats/${id}`);
      const chatData = res.data;

      if (!chatData || !chatData.userIDs || !Array.isArray(chatData.userIDs)) {
        console.error("Invalid chat data received:", chatData);
        return;
      }

      const receiverId = chatData.userIDs.find((userId) => userId !== currentUser.id);

      if (!receiverId) {
        console.error("Could not determine receiver ID");
        return;
      }

      const receiverRes = await apiRequest.get(`/users/${receiverId}`);
      const receiver = receiverRes.data;

      if (!chatData.seenBy.includes(currentUser.id)) {
        decrease();
      }

      setChat({ ...chatData, receiver });
    } catch (err) {
      console.error("Error opening chat:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text || !currentUser || !chat) return;

    try {
      const res = await apiRequest.post(`/messages/${chat.id}`, { text });
      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data],
      }));
      e.target.reset();

      if (socket && chat.receiver) {
        socket.emit("sendMessage", {
          receiverId: chat.receiver.id,
          data: res.data,
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    if (!chat || !socket) return;

    const read = async () => {
      try {
        await apiRequest.put(`/chats/read/${chat.id}`);
      } catch (err) {
        console.error("Error marking chat as read:", err);
      }
    };

    socket.on("getMessage", (data) => {
      if (chat.id === data.chatId) {
        setChat((prev) => ({ ...prev, messages: [...prev.messages, data] }));
        read();
      }
    });

    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);

  return (
    <div className="chatOverlay">
      <div className="chat">
        <div className="chatHeader">
          <h3>Messages</h3>
          <button onClick={handleCloseChat}>Close</button>
        </div>
        <div className="messages">
          {chats.map((c) => (
            <div
              className="message"
              key={c.id}
              style={{
                backgroundColor:
                  currentUser && (c.seenBy.includes(currentUser.id) || chat?.id === c.id)
                    ? "white"
                    : "#fecd514e",
              }}
              onClick={() => handleOpenChat(c.id)}
            >
              <img src={c.receiver?.avatar || "/noavatar.jpg"} alt="User Avatar" />
              <span>{c.receiver?.username || "User"}</span>
              <p>{c.lastMessage}</p>
            </div>
          ))}
        </div>
        {chat && chat.receiver && (
          <div className="chatBox">
            <div className="top">
              <div className="user">
                <img src={chat.receiver.avatar || "/noavatar.jpg"} alt="User Avatar" />
                {chat.receiver.username}
              </div>
              <span className="close" onClick={() => setChat(null)}>X</span>
            </div>
            <div className="center">
              {chat.messages &&
                chat.messages.map((message) => (
                  <div
                    className="chatMessage"
                    style={{
                      alignSelf:
                        message.userId === currentUser?.id ? "flex-end" : "flex-start",
                      textAlign:
                        message.userId === currentUser?.id ? "right" : "left",
                    }}
                    key={message.id}
                  >
                    <p>{message.text}</p>
                    <span>{format(message.createdAt)}</span>
                  </div>
                ))}
              <div ref={messageEndRef}></div>
            </div>
            <form onSubmit={handleSubmit} className="bottom">
              <textarea name="text"></textarea>
              <button>Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
