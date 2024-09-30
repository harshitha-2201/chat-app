import React, { useContext, useEffect, useState } from 'react';
import './profileUpdate.css';
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; // Import these functions
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Import these functions
import { auth, db } from '../../Config/firebase';
import { toast } from 'react-toastify';
import upload from '../../lib/upload'
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [uid, setUid] = useState('');
  const [prevImage, setPrevImage] = useState('');
const {setUserData} = useContext(AppContext)


const profileUpdate = async (event) => {
    event.preventDefault();
    try {
        if (!prevImage && !image) {
            toast.error('Upload profile picture');
            return; // Exit the function early
        }

        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            if (image) {
                const imgUrl = await upload(image);
                await updateDoc(docRef, {
                    avatar: imgUrl,
                    bio: bio,
                    name: name,
                });
            } else {
                await updateDoc(docRef, {
                    bio: bio,
                    name: name,
                });
            }

            const snap = await getDoc(docRef);
            setUserData(snap.data());
            navigate('/chat');
        } else {
            console.error("User document does not exist:", uid);
            toast.error("User document does not exist.");
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message);
    }
};


  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef); // Use await here

        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrevImage(docSnap.data().avatar);
        }
      } else {
        navigate('/');
      }
    });
  }, []);

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor='avatar'>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type='file'
              id='avatar'
              accept='.png, .jpg, .jpeg'
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon}
              alt='Profile'
            />
            Upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder='Your Name'
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder='Write profile bio'
            required
          ></textarea>
          <button type='submit'>Save</button>
        </form>
        <img
          className='profile-pic'
          src={image ? URL.createObjectURL(image) : prevImage || assets.logo_icon}
          alt='Profile'
        />
      </div>
    </div>
  );
}

export default ProfileUpdate;
