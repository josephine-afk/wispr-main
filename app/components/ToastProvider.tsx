'use client';

import { ToastContainer, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom fade transition
const fadeTransition = cssTransition({
  enter: 'toastFadeIn',
  exit: 'toastFadeOut',
  collapse: false // Disable collapse to prevent shrinking
});

export default function ToastProvider() {
  return (
    <ToastContainer 
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover
      transition={fadeTransition}
    />
  );
}