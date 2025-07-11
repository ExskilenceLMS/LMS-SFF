import React, { useState, useEffect } from 'react';

import { Modal, Button, Spinner } from 'react-bootstrap';

import { useNavigate } from 'react-router-dom';

import { useGoogleLogin } from '@react-oauth/google';

import axios from 'axios';

import './Login.css';

import GoogleLogo from './Components/images/search.png';

import Loginpic from './Components/images/img9 1.png';

import CryptoJS from 'crypto-js';

import { secretKey } from './constants';
 
interface UserData {

  access_token: string;

}
 
interface GoogleUserInfo {

  name: string;

  email: string;

  picture: string;

}
 
const Login: React.FC = () => {

  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);

  const [email] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const [showAlert, setShowAlert] = useState<boolean>(false);

  const [alertMessage, setAlertMessage] = useState<string>('');
 
  const handleCloseAlert = (): void => setShowAlert(false);
 
  const handleLogin = useGoogleLogin({

    onSuccess: (codeResponse: UserData) => setUser(codeResponse),

    onError: (error: any) => {

      console.error('Login Failed:', error);

      setAlertMessage('Login Failed');

      setShowAlert(true);

    }

  });
 
    useEffect(() => {

    if (!user) return;

    const fetchUserProfile = async (): Promise<void> => {

        setLoading(true);

        try {

        const { data } = await axios.get<GoogleUserInfo>(

            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,

            {

            headers: {

                Authorization: `Bearer ${user.access_token}`,

            },

            }

        );
 
        const { name, email, picture } = data;
 
        const encryptedName = CryptoJS.AES.encrypt(name, secretKey).toString();

        const encryptedEmail = CryptoJS.AES.encrypt(email, secretKey).toString();

        const encryptedPicture = CryptoJS.AES.encrypt(picture, secretKey).toString();
 
        sessionStorage.setItem("Name", encryptedName);

        sessionStorage.setItem("Email", encryptedEmail);

        sessionStorage.setItem("Picture", encryptedPicture);

        const url = `https://staging-exskilence-be.azurewebsites.net/api/login/${email}/`;
 
        try {

            const response = await axios.get(url);

            // console.log("Response Status:", response);
 
            const encryptedStudentId = CryptoJS.AES.encrypt(response.data.student_id, secretKey).toString();

            const encryptedCourseId = CryptoJS.AES.encrypt(response.data.course_id, secretKey).toString();

            const encryptedBatchId = CryptoJS.AES.encrypt(response.data.batch_id, secretKey).toString();
 
            sessionStorage.setItem("StudentId", encryptedStudentId);

            sessionStorage.setItem("CourseId", encryptedCourseId);

            sessionStorage.setItem("BatchId", encryptedBatchId);
 
            if (response.data.message === "Successfully Logged In") {

            navigate("/Dashboard");

            } else {

            setAlertMessage("User not found");

            setShowAlert(true);

            }

        }

            catch (innerError: any) {

            const decryptedStudentId = CryptoJS.AES.decrypt(

                sessionStorage.getItem("StudentId") || "",

                secretKey

            ).toString(CryptoJS.enc.Utf8);
 
            const errorData = innerError.response?.data || {

                message: innerError.message,

                stack: innerError.stack

            };
 
            const body = {

                student_id: decryptedStudentId,

                Email: email,

                Name: name,

                URL_and_Body: `${url}\n + ""`,

                error: errorData.error,

            };
 
            try {

                await axios.post(

                "https://staging-exskilence-be.azurewebsites.net/api/errorlog/",

                body

                );

            } catch (loggingError) {

                console.error("Error logging the login error:", loggingError);

            }
 
            console.error("Error fetching login data:", innerError);

            setAlertMessage("User not found");

            setShowAlert(true);

            }
 
        } catch (error: any) {

        if (error.response?.status === 504) {

            navigate("/Error504");

        } else {

            console.error("Error fetching Google user info:", error);

            setAlertMessage(

            `User not found with this Email "${user || "unknown"}". Please try again with another email.`

            );

            setShowAlert(true);

        }

        } finally {

        setLoading(false);

        }

    };
 
    fetchUserProfile();

    }, [user, navigate]);
 
  return (
<div className='login'>
<div className="container-fluid h-100 d-flex align-items-center justify-content-center">
<div className="row w-100">
<div className="col-12 col-md-12 col-lg-7 d-flex align-items-center justify-content-center">
<div className="p-4 text-center" style={{ borderRadius: '15px', color: '#003e80', backgroundColor: 'transparent' }}>
<h2 className="font-weight-bold  mb-4">Welcome to Exskilence Upskilling Program</h2>
<p style={{ fontSize: '1.25rem', lineHeight: '1.8', textAlign:'justify' }}>

                        Upskilling refers to the process of acquiring new skills or enhancing existing ones to stay relevant in the ever-evolving job market. As industries rapidly change due to technological advancements and shifting economic landscapes, continuous learning has become essential for career growth and adaptability. By engaging in upskilling, individuals can improve their expertise, increase job opportunities, and remain competitive in their field. For organizations, investing in employee upskilling fosters innovation, boosts productivity, and helps retain top talent, ensuring that the workforce remains agile and future-ready.
</p>
</div>
</div>
<div className="col-12 col-md-10 col-lg-4 mt-5 d-flex flex-column justify-content-center align-items-center p-4">
<div className="loginCard glow card">
<div className="loginCardBody card-body d-flex flex-column align-items-center">
<h3 className="card-title text-center pb-3 mx-1">Login with your Google account</h3>
<div style={{ position: 'relative', width: '100%', height: '400px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<img src={Loginpic} alt="Login" style={{ width: '100%', height: '100%' }} />
</div>
<div className="text-center">

                            {loading ? (
<div className="d-flex justify-content-center text-center align-items-center">
<Spinner color="#0d6efd" size="sm" className='me-2' /> Signing in...
</div>

                            ) : (
<button 

                                onClick={() => handleLogin()} 

                                    className="btn d-flex justify-content-center align-items-center" 

                                    style={{ 

                                        color: 'white', 

                                        fontWeight: 'bold', 

                                        borderRadius: '100%', 

                                        cursor: 'pointer', 

                                        display: 'flex', 

                                        alignItems: 'center', 

                                        padding: '10px',

                                    }}
>
<div style={{ display: 'flex', alignItems: 'center' }}>
<span style={{ 

                                            backgroundColor: '#6f42c1', 

                                            color: 'white', 

                                            padding: '20px', 

                                            textAlign: 'center', 

                                            borderRadius: '20px',

                                            height: '40px',

                                            display: 'flex',

                                            alignItems: 'center',

                                            width: '250px' 

                                        }}>
<img className='me-3' src={GoogleLogo} alt="Google Logo" height={32} width={32} style={{backgroundColor:'white',borderRadius:'0px',padding:"5px"}} />

                                            Sign in with Google
</span>
</div>
</button>

                            )}
</div>
</div>
</div>
</div>
</div>
</div>
<Modal show={showAlert} onHide={handleCloseAlert}  aria-labelledby="contained-modal-title-vcenter" centered>
<Modal.Header closeButton className='bg-primary'>
<Modal.Title>Alert</Modal.Title>
</Modal.Header>
<Modal.Body>{alertMessage}</Modal.Body>
<Modal.Footer>
<Button variant="primary" onClick={handleCloseAlert}>Okay</Button>
</Modal.Footer>
</Modal>
</div>

  );

};
 
export default Login;

 