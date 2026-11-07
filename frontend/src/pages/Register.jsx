import React from 'react';
import { Login } from './Login';

// Register route points seamlessly to the all-in-one Auth page with register mode
export const Register = () => {
  return <Login />;
};
