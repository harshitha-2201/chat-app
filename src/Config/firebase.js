// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword , getAuth, signInWithEmailAndPassword , signOut } from "firebase/auth";
import {doc , getFirestore , setDoc} from 'firebase/firestore'
import {toast} from 'react-toastify'



const firebaseConfig = {
    apiKey: "AIzaSyC7Y6He0ys_9Gm9DcC5_Iqd5WgaI0YN9cA",
    authDomain: "chat-app-9534f.firebaseapp.com",
    projectId: "chat-app-9534f",
    storageBucket: "chat-app-9534f.appspot.com",
    messagingSenderId: "930779933529",
    appId: "1:930779933529:web:fb36db45377b074bb27a48"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)

const signup = async(username , email , password) =>{
 
    try{
       const res = await createUserWithEmailAndPassword(auth , email , password)
       const user = res.user;
       await setDoc(doc(db , "users" , user.uid) , {
        id : user.uid,
        username:username.toLowerCase(),
        email,
        name : " ",
        avatar : " ",
        bio : 'Hey , There i am using chat app',
        lastseen : Date.now()

       })
       await setDoc(doc(db,"chats" , user.uid), {
        chatsData : []
       })
    }
    catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async(email , password) =>{
    try{
        await signInWithEmailAndPassword(auth , email , password)
    }
    catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }

}


const logout = async() =>{
    try{
        await signOut(auth)

    }
    catch(error){
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }

}
export {signup , login , logout , auth , db}


