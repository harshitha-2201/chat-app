import { createContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from '../Config/firebase';
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData);

            if (userData.avatar && userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }

            // Update lastSeen immediately
            await updateDoc(userRef, {
                lastSeen: Date.now(),
            });

            // Set up interval to update lastSeen every 60 seconds
            const intervalId = setInterval(async () => {
                if (chatUser) {
                    await updateDoc(userRef, {
                        lastSeen: Date.now(),
                    });
                }
            }, 60000);

            // Clean up interval on unmount
            return () => clearInterval(intervalId);

        } catch (error) {
            console.error("Error loading user data:", error);  // Logging error for debugging
        }
    };

    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                try {
                    const chatItems = res.data().chatsData;
                    const tempData = [];

                    for (const item of chatItems) {
                        const useRef = doc(db, 'users', item.rId);
                        const userSnap = await getDoc(useRef);
                        const userData = userSnap.data();
                        tempData.push({ ...item, userData });
                    }

                    // Sorting by `updatedAt` timestamp
                    setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));

                } catch (error) {
                    console.error("Error loading chat data:", error);  // Catch and log errors
                }
            });

            // Clean up Firestore subscription when component unmounts or userData changes
            return () => unSub();
        }
    }, [userData]);  // Add userData as dependency for useEffect

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages, setMessages,
        messagesId, setMessagesId,
        chatUser, setChatUser,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
