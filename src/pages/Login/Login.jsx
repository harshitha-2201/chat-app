import React, { useState } from 'react';
import './Login.css';
import assets from '../../assets/assets';
import { signup , login } from '../../Config/firebase';


const Login = () => {
  const [currState, setCurrState] = useState('Sign up');
  const [userName, setUserName] = useState('');
  const[email , setEmail] = useState('');
  const[password , setPassword] = useState('')


  const onSubmitHandler = (event) =>{
    event.preventDefault();
    if(currState === "Sign up"){
      signup(userName , email , password)
    }
    else{
      login(email , password)
    }
  }




  return (
    <div className='login'>
      <img src={assets.logo_big} alt="logo" className='logo' />
      <form  onSubmit = {onSubmitHandler} className='login-form'>
        <h2>{currState}</h2>
        {currState === 'Sign up' && (
          <input type='text' placeholder='Username' className='form-input'required  onChange={(e) =>setUserName(e.target.value)} value ={userName}  />
        )}
        <input type='email' placeholder='Email' className='form-input' required  onChange={(e) =>setEmail(e.target.value)} value ={email}/>
        <input type='password' placeholder='Password' className='form-input' required onChange={(e) =>setPassword(e.target.value)} value ={password} />
        <button type='submit'>
          {currState === 'Sign up' ? 'Create Account' : 'Log In Now'}
        </button>
        <div className='login-term'>
          <input type='checkbox' required />
          <p>Agree to the terms of use & privacy policy</p>
        </div>
        <div className='login-forgot'>
          {currState === 'Sign up' ? (
            <>
              <p className='login-toggle'>Already have an account? </p>
              <span onClick={() => setCurrState('Log In')}>Click here</span>
            </>
          ) : (
            <>
              <p className='login-toggle'>Create an account? </p>
              <span onClick={() => setCurrState('Sign up')}>Click here</span>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
