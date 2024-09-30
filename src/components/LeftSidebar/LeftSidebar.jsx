import React, { useState, useContext } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { collection, query,setDoc, where, getDocs , doc, updateDoc, arrayUnion, serverTimestamp} from "firebase/firestore"; // Ensure correct imports
import { db } from '../../Config/firebase'; // Make sure you have db initialized from your Firebase config
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData , chatData , chatUser , setChatUser , setMessagesId , messagesId } = useContext(AppContext); // Context to access current user data

  const [user, setUser] = useState(null); // Holds the search result
  const [showSearch, setShowSearch] = useState(false); // Controls the visibility of the search result

  const inputHandler = async (e) => {
    try {
      const input = e.target.value.trim(); // Ensure no leading/trailing spaces
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where("username", "==", input.toLowerCase())); // Search query

        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false
          chatData.map((user) =>{
            if(user.rId === querySnap.docs[0].data().id){
              userExist = true;
            }
          })
          if(!userExist){
            setUser(querySnap.docs[0].data()); // Correctly access the first result's data
          }
        } else {
          setUser(null); // No user found
        }
      } else {
        setShowSearch(false); // Hide search result if input is empty
      }
    } catch (error) {
      console.error("Error searching users:", error); // Log any potential errors
    }
  };




  const addChat = async () => {
    const messagesRef = collection(db, "message"); // Correct spelling
    const chatsRef = collection(db, "chats");
  
    try {
      const newMessageRef = doc(messagesRef); // Create a new document reference for messages
  
      // Add the new message document with an empty array and timestamp
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(), // Ensure server-side timestamp is used
        messages: [],
      });
  
      // Update the chat document with the new message reference and other details
      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id, // The receiver's ID
          updatedAt: Date.now(), // Use serverTimestamp for consistency
          messageSeen: true, // Fixed typo
        })
      });
      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id, // The receiver's ID
          updatedAt: Date.now(), // Use serverTimestamp for consistency
          messageSeen: true, // Fixed typo
        })
      });
  
    } catch (error) { 
    toast.error(error.message)
      console.error(error); 
    }
  };
  
const setChat = async(item) =>{
  setMessagesId(item.messageId);
  setChatUser(item)

}
  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="Logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu" />
            <div className="sub-menu">
              <p onClick={() => navigate('/profile')}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="Search Icon" />
          <input onChange={inputHandler} type="text" placeholder="Search here..." />
        </div>
      </div>
      <div className="ls-list">
        {/* Show search result if a user is found */}
        {showSearch && user ? 
          <div className="friends add-user" onClick = {addChat}>
            <img src={user.avatar} alt="User Avatar" /> {/* Fallback avatar */}
            <p>{user.name}</p>
          </div>
         : 
          /* Display default list when no search or no results */
          chatData && chatData.length > 0 ?
          chatData.map((item , index) => (
            <div onClick = {() => setChat(item)} key={index} className="friends">
              <img src={item.userData.avatar} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
          : <p>No chats available</p> 
        }
      </div>
    </div>
  );
};

export default LeftSidebar;