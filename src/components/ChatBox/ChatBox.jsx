import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../Config/firebase";
import { toast } from "react-toastify";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input.trim() && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapShots = await getDoc(userChatsRef);

          if (userChatsSnapShots.exists()) {
            const userChatData = userChatsSnapShots.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messagesId === messagesId
            );

            userChatData.chatsData[chatIndex].lastmessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();

            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
    setInput("");
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(
        doc(db, "messages", messagesId),
        (res) => {
          if (res.exists()) {
            setMessages(res.data().messages.reverse());
          }
        },
        (error) => {
          toast.error("Failed to load messages: " + error.message);
        }
      );
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {chatUser ? (
        <div className="chat-box">
          <div className="chat-user">
            <img src={chatUser.userData.avatar || assets.default_avatar} alt="" />
            <p>
              {chatUser.userData.name}{" "}
              <img className="dot" src={assets.green_dot} alt="" />
            </p>
            <img src={assets.help_icon} className="help" alt="" />
          </div>

          <div className="chat-msg">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                <p className="msg">{msg.text}</p>
                <div>
                  <img
                    src={
                      msg.sId === userData.id
                        ? userData.avatar || assets.default_avatar
                        : chatUser.userData.avatar || assets.default_avatar
                    }
                    alt=""
                  />
                  <p>{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Send a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <input
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              hidden
            />
            <label htmlFor="image">
              <img src={assets.gallery_icon} alt="" />
            </label>
            <img onClick={sendMessage} src={assets.send_button} alt="" />
          </div>
        </div>
      ) : (
        <div className="chat-welcome">
          <img src={assets.logo_icon} alt="" />
          <p>Chat anytime, anywhere</p>
        </div>
      )}
    </>
  );
};

export default ChatBox;
