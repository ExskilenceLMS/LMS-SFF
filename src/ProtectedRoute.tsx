import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { secretKey } from './constants';

const ProtectedRoute: React.FC = () => {
  const encryptedEmail = sessionStorage.getItem('Email');
  const email = encryptedEmail ? CryptoJS.AES.decrypt(encryptedEmail, secretKey).toString(CryptoJS.enc.Utf8) : null;

  // Check if the user is authenticated
  return email ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
